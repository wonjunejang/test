import { Routes, Route } from "react-router-dom";
import AlarmPage from "./features/alarm/pages/AlarmPage.jsx";

// 회의록
import {
  DiscussionList,
  DiscussionDetail,
  DiscussionCreate,
  DiscussionEdit,
} from "./features/discussion";

// todo
import { TodoDetail } from "./features/todo";

// 공지
import { NoticeCreate, NoticeList, NoticeDetail } from "./features/notice";

// 알림
import { NotificationList } from "./features/notification";

// 관리자
import {
  AdminNoticeList,
  AdminNoticeCreate,
  AdminNoticeEdit,
  AdminNoticeDetail,
  UserNoticeList,
  UserNoticeDetail,
  AdminSchedulerPage,
  AdminMainPage,
} from "./features/admin";

import AdminGuard from "./components/AdminGuard.js";

// member
import LoginPage from "./features/member/pages/LoginPage";
import SignPage from "./features/member/pages/SignPage";
import FindMemberId from "./features/member/pages/FindMemberId";
import FindMemberPassword from "./features/member/pages/FindMemberPassword.js";
import MemberInfo from "./features/member/pages/MemberInfoPage";
import ChangeEmail from "./features/member/pages/ChangeEmail";
import ChangePasswordPage from "./features/member/pages/ChangePassword";
import AccountRecoveryPage from "./features/member/pages/AccountRecovery";

// 프로젝트
import {
  ProjectCreatePage,
  ProjectDetailPage,
  ProjectUpdatePage,
  ProjectJoinPage,
  ProjectSettingsPage,
  ProjectMembersPage,
} from "./features/project";
import LoginGuard from "./components/LoginGuard.js";







// import { NotificationList } from "./features/notification/index.jsx";


const Router = () => {
  return (
    <Routes>
      {/* member */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/sign" element={<SignPage />}/>
      <Route path="/findmemberid" element={<FindMemberId />}/>
      <Route path="/findmemberpassword" element={<FindMemberPassword />}/>
      <Route path="/changeemail" element={<ChangeEmail/>}/>
      <Route path="/changepassword" element={< ChangePasswordPage />}/>
      <Route path="/accountrecovery" element={< AccountRecoveryPage />}/>

      <Route element={<LoginGuard />}>
            {/* member + Guard */}
        <Route path="/mypage" element={<MemberInfo/>}/>

        {/* 프로젝트 (invite가 :projectId 위에 있어야 충돌 없음) */}
        <Route path="/projects/invite/:tokenUrl" element={<ProjectJoinPage />} />
        <Route path="/projects/create" element={<ProjectCreatePage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/edit" element={<ProjectUpdatePage />} />
        <Route path="/projects/:projectId/settings" element={<ProjectSettingsPage />} />
        <Route path="/projects/:projectId/members" element={<ProjectMembersPage />} />

        {/* discussion */}
        <Route path="/projects/:projectId/discussions" element={<DiscussionList />} />
        <Route path="/projects/:projectId/discussions/create" element={<DiscussionCreate />} />
        <Route path="/projects/:projectId/discussions/:discussionId" element={<DiscussionDetail />} />
        <Route path="/projects/:projectId/discussions/:discussionId/edit" element={<DiscussionEdit />} />

        {/* notice */}
        <Route path="/projects/:projectId/notices" element={<NoticeList />} />
        <Route path="/projects/:projectId/notices/:noticeId" element={<NoticeDetail />} />

        {/* notification */}
        <Route path="/notifications" element={<NotificationList />} />

        {/* todo */}
        <Route path="/projects/:projectId/todos/:todoId" element={<TodoDetail />} />

        {/* 사용자 공지 */}
        <Route path="/notices" element={<UserNoticeList />} />
        <Route path="/notices/:id" element={<UserNoticeDetail />} />

      </Route>
      



      {/* 관리자 공지 */}
      <Route path="/admin/notices" element={<AdminGuard><AdminNoticeList /></AdminGuard>} />
      <Route path="/admin/notices/create" element={<AdminGuard><AdminNoticeCreate /></AdminGuard>} />
      <Route path="/admin/notices/:id" element={<AdminGuard><AdminNoticeDetail /></AdminGuard>} />
      <Route path="/admin/notices/:id/edit" element={<AdminGuard><AdminNoticeEdit /></AdminGuard>} />

      {/* 관리자 스케쥴러 */}
      <Route path="/admin/scheduler" element={<AdminGuard><AdminSchedulerPage /></AdminGuard>} />

      {/* 관리자 홈 */}
      <Route path="/admin" element={<AdminGuard><AdminMainPage /></AdminGuard>} />
    </Routes>
  );
};

export default Router;