export interface Member {
    username?: string | null;
    password?: string | null;
    memberName?: string | null;
    memberEmail?: string | null;
    joinedAt?: string | null;
    memberStatus?: string | null;
    marketingAgreeYN ?: string | null;
    deleteAt?: string | null;
}

export interface Visible {
    isVisible : boolean,
    toggleVisible : () => void
};

export interface ProjectMember {
    projectId:          number;       // PROJECT_ID
    username:           string;       // USERNAME
    memberRole:         string;       // MEMBER_ROLE
    delYn:              'Y' | 'N';   // DEL_YN
    joinedAt:           string | null;// PROJECT_MEMBER_JOINED_AT
    memberChatBannedYn: 'Y' | 'N';   // MEMBER_CHAT_BANNED_YN
}