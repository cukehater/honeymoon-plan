const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 1544 → "1,544원"
export function formatKrw(won: number) {
  return `${won.toLocaleString("ko-KR")}원`;
}

// 센트 입력. 6000 → "€60", 6050 → "€60.50"
export function formatEur(cents: number) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100).toLocaleString("en-US");
  const rest = abs % 100;
  return `${sign}€${euros}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
}

// "2026-12-06" → "12/6 (일)"
export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${m}/${d} (${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`;
}

// 입력칸용 유로 문자열. 1250 → "12.50", 6000 → "60"
export function centsToInput(cents: number) {
  const rest = cents % 100;
  return `${Math.floor(cents / 100)}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
}
