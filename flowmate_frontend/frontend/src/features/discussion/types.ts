// 회의록 멤버
export interface DiscussionMember {
  username: string;
  memberName: string;
}

// 회의록 목록/상세 응답
export interface DiscussionResponse {
  discussionId: number;
  discussionTitle: string;
  discussionContent: string;
  discussionCreatedAt: string;
  discussionUpdatedAt: string | null;
  createdUsername: string;
  updatedUsername: string | null;
  projectId: number;
  members: DiscussionMember[];
}

// 회의록 작성 요청
export interface DiscussionCreateRequest {
  createdUsername: string;
  discussionTitle: string;
  discussionContent: string;
}

// 회의록 수정 요청
export interface DiscussionUpdateRequest {
  updatedUsername: string;
  discussionTitle: string;
  discussionContent: string;
}

// DiscussionForm onSubmit 데이터
export interface DiscussionFormData {
  title: string;
  content: string;
  members: string[];
  todos: TodoCreateRequest[];
}

// 팀 멤버
export interface TeamMember {
  username: string;
  memberName: string;
  memberRole: string;
  joinedAt: string;
}

// Todo 생성 요청
export interface TodoCreateRequest {
  todoTitle: string;
  todoContent?: string;
  todoPriority?: string;
  projectPartId?: number;
  assigneeUsername?: string;
  todoDueAt?: string;
}

// Discussion Todo 일괄 생성 응답
export interface DiscussionTodoResult {
  index: number;
  success: boolean;
  todoId?: number;
  errorMessage?: string;
}

// Discussion Todo 생성 후 결과
export interface DiscussionTodoBulkResponse {
  successCount: number;
  failCount: number;
  results: DiscussionTodoResult[];
}

export interface ProjectPart {
  partId: number;
  partName: string;
}
