import { useNavigate } from "react-router-dom";
import type { ProjectSimple } from "../types";

interface Props {
  project: ProjectSimple;
  isSelected: boolean; // 현재 선택된 프로젝트인지 여부
}

const ProjectCard = ({ project, isSelected }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      className={`p-2 rounded mb-1 cursor-pointer ${
        isSelected ? "bg-primary text-white" : "hover-bg-light"
      }`}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/projects/${project.projectId}`)}
    >
      <div className="fw-bold text-truncate">{project.projectTitle}</div>
    </div>
  );
};

export default ProjectCard;