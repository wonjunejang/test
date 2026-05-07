import { useState, useEffect } from "react";
import {
  fetchDiscussion,
  fetchDiscussionList,
  fetchDiscussionMembers,
} from "../../../lib/discussionApi";
import type { DiscussionResponse } from "../types";

export const useDiscussionDetail = (projectId: string, discussionId: string) => {
  const [discussion, setDiscussion] = useState<DiscussionResponse | null>(null);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const [detailRes, membersRes] = await Promise.all([
          fetchDiscussion(projectId, discussionId),
          fetchDiscussionMembers(projectId, discussionId),
        ]);
        setDiscussion({ ...detailRes.data, members: membersRes.data });
      } catch (e) {
        console.error("회의록 상세 조회 실패", e);
      } finally {
        setIsLoading(false);
      }
    };

    const loadAllIds = async () => {
      try {
        const res = await fetchDiscussionList(projectId);
        setAllIds(res.data.map((d) => d.discussionId));
      } catch (e) {
        console.error("목록 조회 실패", e);
      }
    };

    loadDetail();
    loadAllIds();
  }, [projectId, discussionId]);

  const currentIndex = allIds.indexOf(Number(discussionId));
  const prevId = currentIndex > 0 ? allIds[currentIndex - 1] : null;
  const nextId = currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : null;

  return { discussion, isLoading, prevId, nextId };
};
