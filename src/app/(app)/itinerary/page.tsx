import { DayTimeline } from "@/components/day-timeline";
import { CITY_NAME } from "@/components/travel";
import { PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const metadata = { title: "일정" };

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default async function ItineraryPage() {
  await getSession();
  const [days, tripAlerts] = await Promise.all([
    db.tripDay.findMany({
      orderBy: { date: "asc" },
      include: {
        alerts: true,
        items: { where: { hidden: false }, orderBy: [{ startTime: "asc" }, { sortOrder: "asc" }] },
      },
    }),
    db.dayAlert.findMany({ where: { date: null } }),
  ]);

  return (
    <>
      <PageHeader title="일정" />
      <nav
        aria-label="날짜 바로가기"
        className="no-scrollbar sticky top-[env(safe-area-inset-top)] z-20 -mx-4 flex gap-2 overflow-x-auto bg-bg/90 px-4 py-2 backdrop-blur-xl"
      >
        {days.map((d, i) => {
          const [, m, dd] = d.date.split("-").map(Number);
          const wd = WEEKDAYS[new Date(Date.UTC(2026, m - 1, dd)).getUTCDay()];
          return (
            <a
              key={d.date}
              href={`#d-${d.date}`}
              className="press flex min-h-11 min-w-[68px] shrink-0 flex-col items-center rounded-[16px] bg-surface px-3 py-2 text-fg no-underline"
            >
              <span className="mono text-[11px] font-semibold text-muted">D{i + 1}</span>
              <span className="mono text-[17px] leading-tight font-bold">
                {m}/{dd}
              </span>
              <span className="text-[11px] text-muted">
                {wd} · {CITY_NAME[d.city]}
              </span>
            </a>
          );
        })}
      </nav>
      {tripAlerts.map((a) => (
        <p key={a.id} role="note" className="rounded-[16px] bg-caution-soft p-4 text-[14px]">
          <b className="text-caution">{a.title}</b> {a.body}
        </p>
      ))}
      {days.map((day, i) => (
        <DayTimeline key={day.date} day={day} index={i} />
      ))}
    </>
  );
}
