import { describe, expect, it } from "vitest";
import { currentTripDay, findNowAndNext, localNow, toInstant } from "./trip-time";

const days = [
  { date: "2026-12-03", tz: "Europe/Lisbon" },
  { date: "2026-12-04", tz: "Europe/Madrid" },
];
const items = [
  { date: "2026-12-03", startTime: "19:30", title: "예트먼" },
  { date: "2026-12-04", startTime: "07:45", title: "체크아웃" },
  { date: "2026-12-04", startTime: "10:15", title: "VY1175" },
];
const at = (iso: string) => new Date(iso);

describe("trip-time", () => {
  it("converts local time to instant per tz", () => {
    expect(toInstant("2026-12-03", "19:30", "Europe/Lisbon").toISOString()).toBe("2026-12-03T19:30:00.000Z");
    expect(toInstant("2026-12-04", "10:15", "Europe/Madrid").toISOString()).toBe("2026-12-04T09:15:00.000Z");
  });

  it("reads local now", () => {
    expect(localNow(at("2026-12-03T23:30:00Z"), "Europe/Madrid")).toEqual({ date: "2026-12-04", time: "00:30" });
  });

  it("keeps 12/3 until Lisbon midnight on the 12/4 move day", () => {
    // 23:30 UTC = 리스본 12/3 23:30(아직 포르투), 마드리드로는 이미 12/4 00:30 → 앞 날짜가 우선
    expect(currentTripDay(days, at("2026-12-03T23:30:00Z"))?.date).toBe("2026-12-03");
    expect(currentTripDay(days, at("2026-12-04T00:30:00Z"))?.date).toBe("2026-12-04");
    expect(currentTripDay(days, at("2026-11-20T12:00:00Z"))).toBeNull();
  });

  it("finds current and next across the tz change", () => {
    const evening = findNowAndNext(days, items, at("2026-12-03T20:00:00Z"));
    expect(evening.current?.title).toBe("예트먼");
    expect(evening.next?.title).toBe("체크아웃");

    // 07:00 UTC = 마드리드 08:00. 체크아웃(07:45 마드리드)은 시작했고 비행(10:15 마드리드)이 다음
    const morning = findNowAndNext(days, items, at("2026-12-04T07:00:00Z"));
    expect(morning.current?.title).toBe("체크아웃");
    expect(morning.next?.title).toBe("VY1175");
  });

  it("has no current item before the day's first item, nothing after the trip", () => {
    const early = findNowAndNext(days, items, at("2026-12-04T05:00:00Z"));
    expect(early.current).toBeNull();
    expect(early.next?.title).toBe("체크아웃");
    expect(findNowAndNext(days, items, at("2026-12-09T00:00:00Z"))).toEqual({ current: null, next: null });
  });
});
