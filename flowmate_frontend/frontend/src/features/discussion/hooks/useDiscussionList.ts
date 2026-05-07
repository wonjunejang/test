import { useState, useEffect } from "react";
import { fetchDiscussionList, deleteDiscussion } from "../../../lib/discussionApi";
import type { DiscussionResponse } from "../types";

export const useDiscussionList = (projectId: string) => {
  const [discussions, setDiscussions] = useState<DiscussionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadList = async (keyword?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchDiscussionList(projectId, keyword);
      setDiscussions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("회의록 목록 조회 실패", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (discussionId: number) => {
    try {
      await deleteDiscussion(projectId, discussionId);
      setDiscussions((prev) => prev.filter((d) => d.discussionId !== discussionId));
    } catch (e) {
      console.error("삭제 실패", e);
      throw e;
    }
  };

  useEffect(() => {
    loadList();
  }, [projectId]);

  return { discussions, isLoading, loadList, handleDelete };
};
