import { useState } from "react";
import { useParams } from "react-router-dom";
import type { TodoCreateRequest } from "../types";
import TodoAddModal from "./TodoAddModal";
import TodoListModal from "./TodoListModal";
import TodoDetailModal from "./TodoDetailModal";
import { useTodoModal } from "../hooks/useTodoModal";

interface Props {
  todos: TodoCreateRequest[];
  onChange: (todos: TodoCreateRequest[]) => void;
}

type ModalType = "add" | "list" | "detail" | null;

const TodoInputList = ({ todos = [], onChange }: Props) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { teamMembers, parts } = useTodoModal(projectId!);

  const handleAdd = (todo: TodoCreateRequest) => {
    onChange([...todos, todo]);
  };

  const handleDelete = (index: number) => {
    onChange(todos.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number, updated: TodoCreateRequest) => {
    onChange(todos.map((todo, i) => (i === index ? updated : todo)));
  };

  const handleSelectTodo = (index: number) => {
    setSelectedIndex(index);
    setModal("detail");
  };

  return (
    <div className="d-flex gap-2 align-items-center">
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm px-4"
        onClick={() => setModal("add")}
      >
        + Todo 추가
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm px-4"
        onClick={() => setModal("list")}
      >
        Todo 목록 보기 ({todos.length})
      </button>

      {modal === "add" && (
        <TodoAddModal
          projectId={projectId!}
          onAdd={handleAdd}
          onClose={() => setModal(null)}
          onOpenList={() => setModal("list")}
        />
      )}
      {modal === "list" && (
        <TodoListModal
          todos={todos}
          teamMembers={teamMembers}
          parts={parts}
          onSelect={handleSelectTodo}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "detail" && selectedIndex !== null && todos[selectedIndex] !== undefined && (
        <TodoDetailModal
          todo={todos[selectedIndex]}
          teamMembers={teamMembers}
          parts={parts}
          onEdit={(updated) => {
            handleEdit(selectedIndex, updated);
            setModal("list");
          }}
          onDelete={() => {
            handleDelete(selectedIndex);
            setModal("list");
          }}
          onClose={() => setModal("list")}
        />
      )}
    </div>
  );
};

export default TodoInputList;
