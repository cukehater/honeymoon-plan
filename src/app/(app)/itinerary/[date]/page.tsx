import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DayAlerts, DayTimeline } from "@/components/day-timeline";
import { PhotoHero } from "@/components/photo-hero";
import { CITY_NAME, CITY_PHOTO } from "@/components/travel";
import { Card } from "@/components/ui";
import { sumKrw } from "@/lib/budget";
import { db } from "@/lib/db";
import { formatDate, formatKrw } from "@/lib/format";
import { getSession } from "@/lib/session";
import { AddItemForm, HideButton } from "../item-editor";

export default async function DayPage({ params }: PageProps<"/itinerary/[date]">) {
  await getSession();
  const { date } = await params;
  const [day, dates, spent] = await Promise.all([
    db.tripDay.findUnique({
      where: { date },
      include: {
        alerts: true,
        items: { orderBy: [{ startTime: "asc" }, { sortOrder: "asc" }] },
      },
    }),
    db.tripDay.findMany({ select: { date: true }, orderBy: { date: "asc" } }),
    db.expense.findMany({ where: { spentOn: date }, select: { amountKrw: true } }),
  ]);
  if (!day) notFound();
  const hidden = day.items.filter((i) => i.hidden);
  const index = dates.findIndex((d) => d.date === date);

  return (
    <>
      <PhotoHero
        src={CITY_PHOTO[day.city]}
        alt={`${CITY_NAME[day.city]} 풍경`}
        height={240}
        top={
          <Link
            href="/itinerary"
            aria-label="전체 일정으로"
            className="press flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md"
          >
            <ChevronLeft size={24} aria-hidden />
          </Link>
        }
      >
        <span className="mono text-[13px] font-semibold opacity-90">
          Day {String(index + 1).padStart(2, "0")} · {formatDate(day.date)} · {CITY_NAME[day.city]}
        </span>
        <h1 className="text-[26px] leading-tight">{day.title}</h1>
      </PhotoHero>

      <Card className="relative -mt-9 flex items-center justify-between shadow-[0_12px_32px_-12px_rgb(16_19_23/0.25)]">
        <span className="text-[14px] font-semibold text-muted">이날 지출 {spent.length}건</span>
        <span className="mono text-[22px] font-bold">{formatKrw(sumKrw(spent))}</span>
      </Card>

      <DayAlerts alerts={day.alerts} />
      <DayTimeline day={{ ...day, items: day.items.filter((i) => !i.hidden) }} index={index} detail />
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
