import { useState, useEffect } from "react";
import {
  getParts,
  createPart,
  updatePart,
  deletePart,
} from "../../../lib/projectApi";
import type { ProjectPart } from "../types";

export const useParts = (projectId: number) => {
  const [parts, setParts] = useState<ProjectPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 파트 목록 조회
  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const res = await getParts(projectId);
      setParts(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "파트 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [projectId]);

  // 파트 추가
  const handleCreatePart = async (partName: string) => {
    try {
      await createPart(projectId, partName);
      // 추가 후 목록 다시 불러오기
      await fetchParts();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "파트 추가에 실패했습니다.");
    }
  };

  // 파트 수정
  const handleUpdatePart = async (partId: number, partName: string) => {
    try {
      await updatePart(projectId, partId, partName);
      await fetchParts();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "파트 수정에 실패했습니다.");
    }
  };

  // 파트 삭제
  const handleDeletePart = async (partId: number) => {
    try {
      await deletePart(projectId, partId);
      await fetchParts();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "파트 삭제에 실패했습니다.");
    }
  };

  return {
    parts,
    isLoading,
    error,
    handleCreatePart,
    handleUpdatePart,
    handleDeletePart,
    fetchParts,
  };
};