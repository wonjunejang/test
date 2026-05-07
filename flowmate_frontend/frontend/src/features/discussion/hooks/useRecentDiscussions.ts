// ANCHOR: useRecentDiscussions
// NOTE: 프로젝트 상세 페이지용 최신 회의록 3개 조회 훅

import { useState, useEffect } from "react";
import { fetchDiscussionList } from "../../../lib/discussionApi";
import type { DiscussionResponse } from "../../discussion/types";

export const useRecentDiscussions = (projectId: number) => {
  const [discussions, setDiscussions] = useState<DiscussionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    fetchDiscussionList(projectId)
      .then((res) => {
        const sorted = [...(Array.isArray(res.data) ? res.data : [])]
          .sort((a, b) => {
            const dateA = new Date(a.discussionUpdatedAt ?? a.discussionCreatedAt).getTime();
            const dateB = new Date(b.discussionUpdatedAt ?? b.discussionCreatedAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 3); // 최신 3개만
        setDiscussions(sorted);
      })
      .catch((e) => console.error("회의록 조회 실패", e))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  return { discussions, isLoading };
};
