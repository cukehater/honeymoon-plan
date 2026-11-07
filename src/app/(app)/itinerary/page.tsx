import { Fragment } from "react";
import { CITY_LABEL, DayAlerts, DayTimeline, cityText } from "@/components/day-timeline";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata = { title: "일정" };

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
      <h1 className="text-[28px]">일정</h1>
      <nav
        aria-label="날짜 바로가기"
        className="no-scrollbar sticky top-[env(safe-area-inset-top)] z-10 -mx-4 -my-4 flex gap-1.5 overflow-x-auto border-b border-line bg-bg px-4 py-2.5"
      >
        {days.map((d) => (
          <a
            key={d.date}
            href={`#d-${d.date}`}
            className={`flex min-h-11 shrink-0 items-center rounded-full border bg-surface px-3 text-[13px] whitespace-nowrap text-fg no-underline ${
              d.city === "barcelona" ? "border-ocre/45" : "border-azul/40"
            }`}
          >
            {formatDate(d.date)}
          </a>
        ))}
      </nav>
      <DayAlerts alerts={tripAlerts} />
      {days.map((day, i) => (
        <Fragment key={day.date}>
          {(i === 0 || days[i - 1].city !== day.city) && (
            <div className="mt-2 flex items-center gap-3 after:h-px after:flex-1 after:bg-line">
              <span className={`text-[15px] font-bold ${cityText(day.city)}`}>{CITY_LABEL[day.city]}</span>
            </div>
          )}
          <DayTimeline day={day} index={i} />
        </Fragment>
      ))}
    </>
  );
}
