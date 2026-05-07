import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectCreate } from "../hooks/useProjectCreate";
import type { ProjectCreateForm } from "../types";
import useAlertStore from "../../member/store/useAlertStore";
import AlertModal from "../../../components/AlertModal";

const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const { handleCreate, isLoading, error } = useProjectCreate();

  const [form, setForm] = useState<ProjectCreateForm>({
    projectTitle: "",
    projectContent: "",
    projectStartDate: "",
    projectEndDate: "",
    partNames: [],
  });

  const [newPartName, setNewPartName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    setForm((prev) => ({
      ...prev,
      partNames: [...prev.partNames, newPartName.trim()],
    }));
    setNewPartName("");
  };

  const handleRemovePart = (index: number) => {
    setForm((prev) => ({
      ...prev,
      partNames: prev.partNames.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreate(form);
  };

  const { isOpen, message, onConfirm, close } = useAlertStore();

  return (
    <>
      {isOpen && (
        <AlertModal
          message={message}
          onConfirm={() => {
            onConfirm?.();
            close();
          }}
        />
      )}
      <div
        className="d-flex flex-column align-items-center container"
        style={{ minHeight: "60vh" }}
      >
        <h1 className="fw-bold mb-5">프로젝트 만들기</h1>

        {error && (
          <div className="alert alert-danger" style={{ width: "100%", maxWidth: "400px" }}>
            {error}
          </div>
        )}

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
              required
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
                required
              />
              <span>~</span>
              <input
                type="date"
                className="form-control"
                name="projectEndDate"
                value={form.projectEndDate}
                onChange={handleChange}
                required
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

            {form.partNames.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-2">
                {form.partNames.map((part, index) => (
                  <span
                    key={index}
                    className="badge bg-light text-dark border d-flex align-items-center gap-1"
                    style={{ fontSize: "0.85rem", padding: "6px 10px" }}
                  >
                    {part}
                    <button
                      type="button"
                      className="btn-close"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => handleRemovePart(index)}
                    />
                  </span>
                ))}
              </div>
            )}

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
              <button type="button" className="btn btn-outline-secondary" onClick={handleAddPart}>
                추가
              </button>
            </div>
          </div>

          {/* 버튼 */}
          <div className="d-flex gap-3 justify-content-center" style={{ marginTop: "3rem" }}>
            <button
              type="button"
              className="btn btn-outline-secondary p-2 w-100"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              취소
            </button>
            <button type="submit" className="btn btn-dark p-2 w-100" disabled={isLoading}>
              {isLoading ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProjectCreatePage;
