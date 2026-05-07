// 중요도 - 백엔드 상수값
export type TodoPriority = "HIGH" | "MID" | "LOW";

// 상태 - 백엔드 상수값
// TDEXT=예정, TDINPROG=진행중, TDFIN=완료
// 지연(LATE)은 DB 저장 안 함 - 마감일 지났는지 계산해서 표시용으로만 사용
export type TodoStatus = "TDEXT" | "TDINPROG" | "TDFIN";

// 첨부파일
export interface TodoFileResponse {
  fileId: number;
  originalFileName: string;
  storedFileName: string;
  filPath: string;
  mimeType: string;
  fileSize: number;
}

// 목록 조회 시 Todo 하나 (TodoListResponse 기준)
export interface TodoListResponse {
  todoId: number;
  todoTitle: string;
  todoPriority: TodoPriority;
  todoStatus: TodoStatus;
  todoStatusName: string;
  todoDueAt: string;
  writerUsername: string;
  writerMemberName: string;
  assigneeUsername: string;
  assigneeMemberName: string;
  projectPartId: number;
  projectPartName: string;
  fileCount: number;
  delayed: boolean;
  displayStatusName: string;
}

// 페이징 응답 (TodoPageResponse 기준)
export interface TodoPageResponse {
  todos: TodoListResponse[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 상세 조회 응답 (TodoDetailResponse 기준)
export interface TodoDetailResponse {
  todoId: number;
  todoTitle: string;
  todoContent: string;
  todoPriority: TodoPriority;
  todoStatus: TodoStatus;
  todoStatusName: string;
  delayed: boolean;
  displayStatusName: string;
  todoCreateAt: string;
  todoDueAt: string;
  writerUsername: string;
  writerMemberName: string;
  assigneeUsername: string;
  assigneeMemberName: string;
  projectPartId: number;
  projectPartName: string;
  projectId: number;
  files: TodoFileResponse[];
  editable: boolean;
  deletable: boolean;
}

// 진행률 응답 (TodoProgressResponse 기준)
export interface TodoProgressResponse {
  totalProgress: number;
  personalProgress: number;
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
}

// 목록 검색/필터 파라미터 (TodoSearchRequest 기준)
export interface TodoSearchRequest {
  keyword?: string | undefined;
  status?: TodoStatus | undefined;
  projectPartId?: number | undefined;
  priority?: TodoPriority | undefined;
  assigneeUsername?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
  sort?: string | undefined;
}

// 투두 생성 요청 (TodoCreateRequest 기준)
// 생성 시 status는 백엔드에서 자동으로 TDEXT(예정)으로 세팅
export interface TodoCreateRequest {
  todoTitle: string;
  todoContent: string;
  todoPriority: TodoPriority;
  todoDueAt: string;
  projectPartId: number;
  assigneeUsername: string;
}

// 투두 수정 요청 (TodoUpdateRequest 기준)
export interface TodoUpdateRequest {
  todoTitle: string;
  todoContent: string;
  todoStatus: TodoStatus;
  todoPriority: TodoPriority;
  todoDueAt: string;
  projectPartId: number;
  assigneeUsername: string;
  deleteFileIds?: number[] | undefined;
}