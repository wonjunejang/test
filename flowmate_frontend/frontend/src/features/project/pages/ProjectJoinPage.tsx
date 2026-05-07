import { useParams, useNavigate } from "react-router-dom";
import { useProjectJoin } from "../hooks/useProjectJoin";

const ProjectJoinPage = () => {
  const { tokenUrl } = useParams<{ tokenUrl: string }>();
  const navigate = useNavigate();
  const { previewProject, handleJoin, isLoading, error } =
    useProjectJoin(tokenUrl ?? "");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.slice(0, 10).replace(/-/g, ".");
  };

  if (isLoading) return <div className="text-center mt-5">로딩 중...</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h4 className="card-title fw-bold mb-3">프로젝트 초대</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          {previewProject && (
            <>
              <h5 className="mb-2">{previewProject.projectTitle}</h5>
              <p className="text-muted small mb-1">
                기간: {formatDate(previewProject.projectStartDate)} ~{" "}
                {formatDate(previewProject.projectEndDate)}
              </p>
              <p className="text-muted small mb-1">
                팀장: {previewProject.leaderName}
              </p>
              <p className="text-muted small mb-3">
                {previewProject.projectContent}
              </p>

              {/* 파트 목록 */}
              <div className="mb-4">
                {previewProject.parts.map((part) => (
                  <span
                    key={part.partId}
                    className="badge bg-secondary me-1"
                  >
                    {part.partName}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              거절
            </button>
            <button
              className="btn btn-primary"
              onClick={handleJoin}
              disabled={isLoading || !!error}
            >
              {isLoading ? "참여 중..." : "참여하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectJoinPage;