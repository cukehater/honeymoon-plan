import Link from "next/link";
import { notFound } from "next/navigation";
import { DayTimeline } from "@/components/day-timeline";
import { db } from "@/lib/db";
import { formatKrw } from "@/lib/format";

export default async function DayPage({ params }: PageProps<"/itinerary/[date]">) {
  const { date } = await params;
  const [day, dates, spent] = await Promise.all([
    db.tripDay.findUnique({
      where: { date },
      include: {
        alerts: true,
        items: { where: { hidden: false }, orderBy: { sortOrder: "asc" } },
      },
    }),
    db.tripDay.findMany({ select: { date: true }, orderBy: { date: "asc" } }),
    db.expense.aggregate({ where: { spentOn: date }, _sum: { amountKrw: true }, _count: true }),
  ]);
  if (!day) notFound();
  const index = dates.findIndex((d) => d.date === date);

  return (
    <>
      <nav className="text-sm">
        <Link href="/itinerary" className="inline-flex min-h-11 items-center">
          ← 전체 일정
        </Link>
      </nav>
      <DayTimeline day={day} index={index} detail />
      <section className="flex items-center justify-between rounded-[10px] border border-line bg-surface px-4 py-3.5">
        <span className="text-sm text-muted">이날 지출 {spent._count}건</span>
        <span className="mono text-xl">{formatKrw(spent._sum.amountKrw ?? 0)}</span>
      </section>
    </>
  );
}
