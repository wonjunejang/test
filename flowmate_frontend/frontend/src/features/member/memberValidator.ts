// 정규표현식 상수 정의
export const USERNAME_PATTERN = /^(?=.*[a-z])[a-z0-9]{6,20}$/;
export const EMAIL_PATTERN = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

/**
 * 아이디, 이메일, 비밀번호 유효성 검사 함수
 */
export const isValidMemberInput = (pattern: RegExp, matchStr: string | null | undefined): boolean => {
    if (!matchStr) return false;
    return !!matchStr && pattern.test(matchStr);
};