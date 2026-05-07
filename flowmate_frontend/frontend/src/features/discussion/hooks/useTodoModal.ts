import { useState, useEffect } from "react";
import { fetchTeamMembers, fetchProjectParts } from "../../../lib/discussionApi";
import type { TeamMember, ProjectPart, TodoCreateRequest } from "../types";

export const useTodoModal = (projectId: string) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [parts, setParts] = useState<ProjectPart[]>([]);

  useEffect(() => {
    fetchTeamMembers(projectId).then((res) => setTeamMembers(res.data));
    fetchProjectParts(projectId).then((res) => setParts(res.data));
  }, [projectId]);

  return { teamMembers, parts };
};
