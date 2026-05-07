import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectDetail } from "../hooks/useProjectDetail";
import { useProjectUpdate } from "../hooks/useProjectUpdate";
import { useParts } from "../hooks/useParts";
import type { ProjectUpdateForm } from "../types";

const ProjectUpdatePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const id = Number(projectId);

  const { currentProject } = useProjectDetail(id);
  const { handleUpdate, isLoading, error } = useProjectUpdate(id);
  const { parts, handleCreatePart, handleDeletePart } = useParts(id);

  const [form, setForm] = useState<ProjectUpdateForm>({
    projectTitle: "",
    projectContent: "",
    projectStartDate: "",
    projectEndDate: "",
  });

  const [newPartName, setNewPartName] = useState("");

  // 기존 데이터 폼에 채우기
  useEffect(() => {
    if (!currentProject) return;
    setForm({
      projectTitle: currentProject.projectTitle,
      projectContent: currentProject.projectContent,
      projectStartDate: currentProject.projectStartDate.slice(0, 10),
      projectEndDate: currentProject.projectEndDate.slice(0, 10),
    });
  }, [currentProject]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate(form);
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    handleCreatePart(newPartName.trim());
    setNewPartName("");
  };

  return (
    <div className="d-flex flex-column align-items-center container">
      <h1 className="fw-bold mb-5">프로젝트 수정</h1>

      {error && <div className="alert alert-danger w-100" style={{ width: "100%", maxWidth: "400px" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>

        {/* 프로젝트 명 */}
        <div className="mb-3">
          <label className="form-label text-muted small">프로젝트 명</label>
          <input
            type="text"
            className="form-control"
            name="projectTitle"
            value={form.projectTitle}
            onChange={handleChange}
            placeholder="프로젝트 명을 입력하세요."
          />
        </div>

        {/* 기간 */}
        <div className="mb-3">
          <label className="form-label text-muted small">기간</label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="date"
              className="form-control"
              name="projectStartDate"
              value={form.projectStartDate}
              onChange={handleChange}
            />
            <span>~</span>
            <input
              type="date"
              className="form-control"
              name="projectEndDate"
              value={form.projectEndDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* 설명 */}
        <div className="mb-3">
          <label className="form-label text-muted small">설명</label>
          <textarea
            className="form-control"
            name="projectContent"
            value={form.projectContent}
            onChange={handleChange}
            placeholder="프로젝트 설명을 입력하세요."
            rows={4}
          />
        </div>

        {/* 파트 추가 */}
        <div className="mb-4">
          <label className="form-label text-muted small">파트 추가</label>

          {/* 기존 파트 태그 목록 */}
          <div className="d-flex flex-wrap gap-2 mb-2">
            {parts.map((part) => (
              <span
                key={part.partId}
                className="badge bg-light text-dark border d-flex align-items-center gap-1"
                style={{ fontSize: "0.85rem", padding: "6px 10px" }}
              >
                {part.partName}
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  style={{ fontSize: "0.6rem" }}
                  onClick={() => handleDeletePart(part.partId)}
                />
              </span>
            ))}
          </div>

          {/* 파트 입력 */}
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="파트를 추가하세요."
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPart();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleAddPart}
            >
              추가
            </button>
          </div>
        </div>

        {/* 버튼 */}
        <div className="d-flex gap-3 justify-content-center"
          style={{marginTop:"3rem"}}
        >
          <button
            type="button"
            className="btn btn-outline-secondary p-2 w-100"
            onClick={() => navigate(`/projects/${id}/settings`)}
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-dark p-2 w-100"
            disabled={isLoading}
          >
            {isLoading ? "수정 중..." : "수정"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectUpdatePage;