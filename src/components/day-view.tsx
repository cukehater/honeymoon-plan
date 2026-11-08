import { notFound } from "next/navigation";
import { AddItemForm, HideButton } from "@/app/(app)/itinerary/item-editor";
import { sumKrw } from "@/lib/budget";
import { db } from "@/lib/db";
import { formatDate, formatKrw } from "@/lib/format";
import { currentTripDay } from "@/lib/trip-time";
import { DateNav } from "./date-nav";
import { DayAlerts, DayTimeline } from "./day-timeline";
import { PhotoHero } from "./photo-hero";
import { CITY_NAME, dayPhoto } from "./travel";
import { Card } from "./ui";

// 일정 탭의 하루 화면. /itinerary(오늘·첫날)와 /itinerary/[date]가 함께 쓴다.
export async function DayView({ date }: { date: string }) {
  const [day, days, spent, tripAlerts] = await Promise.all([
    db.tripDay.findUnique({
      where: { date },
      include: { alerts: true, items: { orderBy: [{ startTime: "asc" }, { sortOrder: "asc" }] } },
    }),
    db.tripDay.findMany({ select: { date: true, city: true, tz: true }, orderBy: { date: "asc" } }),
    db.expense.findMany({ where: { spentOn: date }, select: { amountKrw: true } }),
    db.dayAlert.findMany({ where: { date: null } }),
  ]);
  if (!day) notFound();
  const index = days.findIndex((d) => d.date === date);
  const today = currentTripDay(days, new Date())?.date ?? null;
  const hidden = day.items.filter((i) => i.hidden);
  const navDays = days.map((d) => {
    const [mmdd, weekday] = formatDate(d.date).split(" ");
    return { date: d.date, label: mmdd, weekday: weekday.replace(/[()]/g, ""), city: CITY_NAME[d.city] };
  });

  return (
    <>
      <DateNav days={navDays} active={date} today={today} />
      <PhotoHero src={dayPhoto(days, day.date)} alt={`${CITY_NAME[day.city]} 풍경`} height={200} inset>
        <h1 className="text-[24px] leading-tight">{day.title}</h1>
        <p className="mono text-[14px] font-semibold opacity-90">
          Day {index + 1} · {formatDate(day.date)} · {CITY_NAME[day.city]}
        </p>
      </PhotoHero>

      <Card className="relative mx-3 -mt-10 flex items-center justify-between shadow-[0_12px_32px_-12px_rgb(16_19_23/0.25)]">
        <span className="text-[14px] font-semibold text-muted">이날 지출 {spent.length}건</span>
        <span className="mono text-[22px] font-bold">{formatKrw(sumKrw(spent))}</span>
      </Card>

      <DayAlerts alerts={[...tripAlerts, ...day.alerts]} />
      <DayTimeline day={{ ...day, items: day.items.filter((i) => !i.hidden) }} />
      <AddItemForm date={day.date} />
      {hidden.length > 0 && (
        <Card>
          <h2 className="mb-2 text-[17px]">숨긴 항목</h2>
          <ul className="flex flex-col">
            {hidden.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 first:border-t-0">
                <span className="text-[14px] text-muted">
                  <span className="mono mr-2">{i.startTime}</span>
                  {i.title}
                </span>
                <HideButton id={i.id} hidden={false} label="다시 보이기" />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
