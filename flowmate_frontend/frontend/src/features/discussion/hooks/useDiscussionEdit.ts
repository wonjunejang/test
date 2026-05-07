import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchDiscussion,
  fetchDiscussionMembers,
  updateDiscussion,
  updateDiscussionMembers,
} from "../../../lib/discussionApi";
import type { DiscussionFormData, DiscussionResponse, DiscussionMember } from "../types";
import useMemberStore from "../../member/store/useMemberStore";

type InitialData = DiscussionResponse & { members: DiscussionMember[] };

export const useDiscussionEdit = () => {
  const { projectId, discussionId } = useParams<{ projectId: string; discussionId: string }>();
  const navigate = useNavigate();
  const username = useMemberStore((state) => state.memberInfo?.username);

  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!discussionId) return;
    const load = async () => {
      try {
        const [detailRes, membersRes] = await Promise.all([
          fetchDiscussion(projectId!, discussionId),
          fetchDiscussionMembers(projectId!, discussionId),
        ]);
        setInitialData({ ...detailRes.data, members: membersRes.data });
      } catch (e) {
        console.error("회의록 불러오기 실패", e);
      }
    };
    load();
  }, [projectId, discussionId]);

  const handleSubmit = async ({ title, content, members }: DiscussionFormData) => {
    setIsLoading(true);
    try {
      await updateDiscussion(projectId!, discussionId!, {
        updatedUsername: username!,
        discussionTitle: title,
        discussionContent: content,
      });
      // NOTE: 작성자 본인은 UI에서 제외되므로 요청 시 자동으로 포함
      const membersWithAuthor =
        username && !members.includes(username) ? [username, ...members] : members;
      await updateDiscussionMembers(projectId!, discussionId!, membersWithAuthor);
      navigate(`/projects/${projectId}/discussions/${discussionId}`);
    } catch (e) {
      console.error("회의록 수정 실패", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { initialData, isLoading, handleSubmit };
};
