import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createDiscussion,
  addDiscussionMembers,
  createDiscussionTodos,
} from "../../../lib/discussionApi";
import type { DiscussionFormData } from "../types";
import useMemberStore from "../../member/store/useMemberStore";

export const useDiscussionCreate = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const username = useMemberStore((state) => state.memberInfo?.username);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async ({ title, content, members, todos }: DiscussionFormData) => {
    setIsLoading(true);

    try {
      const res = await createDiscussion(projectId!, {
        createdUsername: username!,
        discussionTitle: title,
        discussionContent: content,
      });
      const discussionId = res.data.discussionId;

      // NOTE: 작성자 본인은 UI에서 제외되므로 요청 시 자동으로 포함
      const membersWithAuthor =
        username && !members.includes(username) ? [username, ...members] : members;
      if (membersWithAuthor.length > 0) {
        await addDiscussionMembers(projectId!, discussionId, membersWithAuthor);
      }

      if (todos.length > 0 && username) {
        await createDiscussionTodos(projectId!, discussionId, username, todos);
      }

      navigate(`/projects/${projectId}/discussions`);
    } catch (e) {
      console.error("회의록 작성 실패", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSubmit };
};
