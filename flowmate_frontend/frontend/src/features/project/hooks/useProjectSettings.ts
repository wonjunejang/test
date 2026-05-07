import { useMembers } from "./useMembers";
import { useParts } from "./useParts";

export const useProjectSettings = (projectId: number) => {
  const members = useMembers(projectId);
  const parts = useParts(projectId);

  return { members, parts };
};