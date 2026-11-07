import Link from "next/link";
import { notFound } from "next/navigation";
import { DayTimeline } from "@/components/day-timeline";
import { AddItemForm, HideButton } from "../item-editor";
import { sumKrw } from "@/lib/budget";
import { db } from "@/lib/db";
import { formatKrw } from "@/lib/format";
import { getSession } from "@/lib/session";

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
      <nav className="text-sm">
        <Link href="/itinerary" className="inline-flex min-h-11 items-center">
          ← 전체 일정
        </Link>
      </nav>
      <DayTimeline day={{ ...day, items: day.items.filter((i) => !i.hidden) }} index={index} detail />
      <AddItemForm date={day.date} />
      {hidden.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-base">숨긴 항목</h2>
          <ul className="flex flex-col">
            {hidden.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 first:border-t-0">
                <span className="text-sm text-muted">
                  <span className="mono mr-2">{i.startTime}</span>
                  {i.title}
                </span>
                <HideButton id={i.id} hidden={false} label="다시 보이기" />
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="flex items-center justify-between rounded-[10px] border border-line bg-surface px-4 py-3.5">
        <span className="text-sm text-muted">이날 지출 {spent.length}건</span>
        <span className="mono text-xl">{formatKrw(sumKrw(spent))}</span>
      </section>
    </>
  );
}
