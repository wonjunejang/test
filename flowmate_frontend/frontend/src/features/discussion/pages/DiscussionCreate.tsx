import { useDiscussionCreate } from "../hooks/useDiscussionCreate";
import DiscussionForm from "../components/DiscussionForm";

const DiscussionCreate = () => {
  const { isLoading, handleSubmit } = useDiscussionCreate();

  return <DiscussionForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />;
};

export default DiscussionCreate;
