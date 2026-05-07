import { useDiscussionEdit } from "../hooks/useDiscussionEdit";
import DiscussionForm from "../components/DiscussionForm";

const DiscussionEdit = () => {
  const { initialData, isLoading, handleSubmit } = useDiscussionEdit();

  if (!initialData) return <div className="text-center py-5 text-muted">불러오는 중...</div>;

  return (
    <DiscussionForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};

export default DiscussionEdit;
