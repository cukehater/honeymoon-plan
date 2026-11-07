import Link from "next/link";
import { DayAlerts, citySoft } from "@/components/day-timeline";
import { SummaryTiles } from "@/components/summary-tiles";
import type { ItineraryItem } from "@/generated/prisma/client";
import { summarizeBudget, sumKrw } from "@/lib/budget";
import { db } from "@/lib/db";
import { formatDate, formatKrw } from "@/lib/format";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { currentTripDay, findNowAndNext, localNow } from "@/lib/trip-time";

// 개발 중에만 ?now=2026-12-06T14:00:00+01:00 으로 현재 시각을 바꿔 화면을 확인한다
function resolveNow(param: string | string[] | undefined) {
  if (process.env.NODE_ENV !== "production" && typeof param === "string") {
    const d = new Date(param);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

function ItemCard({ label, item }: { label: string; item: ItineraryItem | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-[10px] border border-line bg-surface px-4 py-3.5">
      <span className="text-xs text-muted">{label}</span>
      {item ? (
        <>
          <span className="font-semibold">
            <span className="mono mr-2 text-[13px] text-muted">
              {formatDate(item.date).split(" ")[0]} {item.startTime}
            </span>
            {item.title}
          </span>
          {item.description && <span className="text-sm text-muted">{item.description}</span>}
        </>
      ) : (
        <span className="text-sm text-muted">없음</span>
      )}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  await getSession();
  const now = resolveNow((await searchParams).now);
  const [days, items, budgetItems, expenses, settings, checklist] = await Promise.all([
    db.tripDay.findMany({ orderBy: { date: "asc" }, include: { alerts: true } }),
    db.itineraryItem.findMany({ where: { hidden: false }, orderBy: [{ date: "asc" }, { sortOrder: "asc" }] }),
    db.budgetItem.findMany(),
    db.expense.findMany({ select: { spentOn: true, category: true, currency: true, amountMinor: true, amountKrw: true, budgetItemId: true } }),
    getSettings(),
    db.checklistItem.findMany({ select: { checkedById: true } }),
  ]);
  const summary = summarizeBudget({ budgetItems, expenses, ...settings });
  const first = days[0];
  const last = days[days.length - 1];
  const today = currentTripDay(days, now);
  const before = !today && localNow(now, first.tz).date < first.date;
  const done = checklist.filter((c) => c.checkedById).length;

  const checklistBar = (
    <Link href="/checklist" className="flex flex-col gap-2 rounded-[10px] border border-line bg-surface px-4 py-3.5 text-fg no-underline">
      <span className="flex justify-between text-sm">
        <span>출발 전 체크리스트</span>
        <span className="mono text-muted">
          {done}/{checklist.length}
        </span>
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <i className="block h-full bg-ok" style={{ width: `${(done / checklist.length) * 100}%` }} />
      </span>
    </Link>
  );

  if (today) {
    const index = days.indexOf(today);
    const { current, next } = findNowAndNext(days, items, now);
    return (
      <>
        <header className="flex flex-col gap-2">
          <span className={`mono self-start rounded px-2 py-0.5 text-[13px] ${citySoft(today.city)}`}>
            {formatDate(today.date)} · {localNow(now, today.tz).time} 현지
          </span>
          <h1 className="text-[28px]">여행 {index + 1}일차</h1>
          <p className="text-muted">{today.title}</p>
        </header>
        <DayAlerts alerts={today.alerts} />
        <div className="grid gap-3 sm:grid-cols-2">
          <ItemCard label="지금" item={current} />
          <ItemCard label="다음 일정" item={next} />
        </div>
        <Link
          href={`/itinerary/${today.date}`}
          className="flex items-center justify-between rounded-[10px] border border-line bg-surface px-4 py-3.5 text-fg no-underline"
        >
          <span className="text-sm text-muted">오늘 지출</span>
          <span className="mono text-xl">{formatKrw(sumKrw(expenses.filter((e) => e.spentOn === today.date)))}</span>
        </Link>
        <SummaryTiles s={summary} />
      </>
    );
  }

  if (before) {
    const dday = daysBetween(localNow(now, first.tz).date, first.date);
    const firstItems = items.filter((i) => i.date === first.date);
    return (
      <>
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[.12em] text-muted uppercase">Honeymoon · 2026.11.30 – 12.08</span>
          <h1 className="text-[clamp(28px,8vw,42px)]">출발까지 D-{dday}</h1>
        </header>
        {checklistBar}
        <SummaryTiles s={summary} />
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">
            <Link href={`/itinerary/${first.date}`} className="text-fg">
              첫날 · {first.title}
            </Link>
          </h2>
          <ol className="flex flex-col">
            {firstItems.map((i) => (
              <li key={i.id} className="grid grid-cols-[52px_1fr] gap-2.5 border-t border-line py-2 first:border-t-0">
                <span className="mono text-[13px] text-muted">{i.startTime}</span>
                <span className="text-sm">{i.title}</span>
              </li>
            ))}
          </ol>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[.12em] text-muted uppercase">
          {formatDate(first.date)} – {formatDate(last.date)}
        </span>
        <h1 className="text-[28px]">여행을 마쳤어요</h1>
        <p className="text-muted">최종 경비</p>
      </header>
      <SummaryTiles s={summary} />
      <Link href="/expenses" className="inline-flex min-h-11 items-center">
        경비 자세히 보기
      </Link>
    </>
  );
}
