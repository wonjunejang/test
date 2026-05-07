import { useNavigate } from "react-router-dom"

const ProjectEmptyPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "70vh" }}
    >
      <button
        className="btn btn-outline-secondary"
        style={{
          width: "300px",
          padding: "20px",
          fontSize: "1rem",
          borderRadius: "8px",
        }}
        onClick={() => navigate("/projects/create")}
      >
        프로젝트 만들기
      </button>
    </div>
  );
};

export default ProjectEmptyPage;