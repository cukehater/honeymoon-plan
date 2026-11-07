// 일정 시각은 현지 시각 문자열이고, 날짜마다 TripDay.tz를 쓴다.
type Day = { date: string; tz: string };
type Item = { date: string; startTime: string };

function parts(now: Date, tz: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

// tz 기준 현지 날짜·시각. { date: "2026-12-06", time: "14:00" }
export function localNow(now: Date, tz: string) {
  return parts(now, tz);
}

// 현지 날짜+시각 → 실제 시점
export function toInstant(date: string, time: string, tz: string): Date {
  const guess = new Date(`${date}T${time}:00Z`);
  const shown = parts(guess, tz);
  const offset = new Date(`${shown.date}T${shown.time}:00Z`).getTime() - guess.getTime();
  return new Date(guess.getTime() - offset);
}

// 오늘 여행일: 각 날짜를 그 날짜의 tz로 본 현지 날짜와 비교한다. 이동일처럼 두 날짜가 겹치면 앞 날짜.
// 여행 기간 밖이면 null. days는 날짜순이어야 한다.
export function currentTripDay<D extends Day>(days: D[], now: Date): D | null {
  return days.find((d) => localNow(now, d.tz).date === d.date) ?? null;
}

// 지금 진행 중(오늘 이미 시작한 마지막 항목)과 다음 일정(아직 시작하지 않은 첫 항목).
export function findNowAndNext<I extends Item>(days: Day[], items: I[], now: Date) {
  const tzOf = new Map(days.map((d) => [d.date, d.tz]));
  const today = currentTripDay(days, now)?.date;
  const timed = items
    .map((item) => ({ item, at: toInstant(item.date, item.startTime, tzOf.get(item.date)!).getTime() }))
    .sort((a, b) => a.at - b.at);
  const nextIdx = timed.findIndex((t) => t.at > now.getTime());
  const prev = timed[(nextIdx === -1 ? timed.length : nextIdx) - 1];
  return {
    current: prev && prev.item.date === today ? prev.item : null,
    next: nextIdx === -1 ? null : timed[nextIdx].item,
  };
}
