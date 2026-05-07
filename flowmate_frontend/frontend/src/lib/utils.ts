// ANCHOR: utils
// NOTE: 공통 유틸 함수 모음

// SECTION: 날짜 포맷
// NOTE: ISO 8601 형식(2026-04-27T07:33:14.080+00:00)을 한국 시간 기준으로 변환
// NOTE: null이거나 수정 이력이 없는 경우 "-" 반환
// ex) "2026년 04월 27일 16:33"
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  });
}
// !SECTION

// SECTION: 중요도 변환
// NOTE: 백엔드 값(HIGH/MID/LOW) → 프론트 표기(상/중/하)
const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "상",
  MID: "중",
  LOW: "하",
};

export function formatPriority(value: string | null | undefined): string {
  if (!value) return "-";
  return PRIORITY_LABEL[value.toUpperCase()] ?? value;
}

// NOTE: 프론트 표기(상/중/하) → 백엔드 값(HIGH/MID/LOW)
const PRIORITY_VALUE: Record<string, string> = {
  상: "HIGH",
  중: "MID",
  하: "LOW",
};

export function parsePriority(label: string): string {
  return PRIORITY_VALUE[label] ?? label;
}
// !SECTION

// ANCHOR: utils-end
