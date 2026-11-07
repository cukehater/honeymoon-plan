import Link from "next/link";
import { ChevronRight, MapPin, TriangleAlert } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { PhotoHero } from "@/components/photo-hero";
import { SummaryTiles } from "@/components/summary-tiles";
import { CITY_NAME, KIND_ICON, dayPhoto, mapUrl } from "@/components/travel";
import { Badge, Card, IconTile, ProgressBar, SectionTitle } from "@/components/ui";
import type { DayAlert, ItineraryItem } from "@/generated/prisma/client";
import { summarizeBudget, sumKrw } from "@/lib/budget";
import { db } from "@/lib/db";
import { formatDate, formatKrw } from "@/lib/format";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { currentTripDay, findNowAndNext, localNow, toInstant } from "@/lib/trip-time";

// 개발 중에만 ?now=2026-12-06T14:00:00+01:00 으로 현재 시각을 바꿔 화면을 확인한다
function resolveNow(param: string | string[] | undefined) {
  if (process.env.NODE_ENV !== "production" && typeof param === "string") {
    const d = new Date(param);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

// "35분 후", "2시간 10분 후", 다음 날이면 날짜
function untilText(minutes: number, item: ItineraryItem, today: string) {
  if (item.date !== today) return formatDate(item.date);
  if (minutes < 60) return `${minutes}분 후`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}시간${m ? ` ${m}분` : ""} 후`;
}

function Alerts({ alerts }: { alerts: DayAlert[] }) {
  return alerts.map((a) => (
    <div key={a.id} role="note" className="flex gap-3 rounded-[var(--radius-card)] bg-caution-soft p-4 text-[14px] leading-relaxed text-fg">
      <TriangleAlert size={20} className="mt-0.5 shrink-0 text-caution" aria-hidden />
      <p>
        <b className="block text-caution">{a.title}</b>
        {a.body}
      </p>
    </div>
  ));
}

// 사진 위 맨 윗줄: 두 사람 이름과 로그아웃
function HeroTop({ couple }: { couple: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex rounded-full bg-black/35 px-3 py-1 text-[13px] font-semibold text-white backdrop-blur-md">{couple}</span>
      <LogoutButton />
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  await getSession();
  const now = resolveNow((await searchParams).now);
  const [days, items, budgetItems, expenses, settings, checklist, users] = await Promise.all([
    db.tripDay.findMany({ orderBy: { date: "asc" }, include: { alerts: true } }),
    db.itineraryItem.findMany({ where: { hidden: false }, orderBy: [{ date: "asc" }, { startTime: "asc" }, { sortOrder: "asc" }] }),
    db.budgetItem.findMany(),
    db.expense.findMany({ select: { spentOn: true, category: true, currency: true, amountMinor: true, amountKrw: true, budgetItemId: true } }),
    getSettings(),
    db.checklistItem.findMany({ select: { checkedById: true } }),
    db.user.findMany({ orderBy: { id: "asc" } }),
  ]);
  const summary = summarizeBudget({ budgetItems, expenses, ...settings });
  const first = days[0];
  const last = days[days.length - 1];
  const today = currentTripDay(days, now);
  const before = !today && localNow(now, first.tz).date < first.date;
  const done = checklist.filter((c) => c.checkedById).length;
  const couple = users.map((u) => u.name).join(" · ");

  if (today) {
    const index = days.indexOf(today);
    const { current, next } = findNowAndNext(days, items, now);
    const nextAt = next ? toInstant(next.date, next.startTime, days.find((d) => d.date === next.date)!.tz) : null;
    const minutes = nextAt ? Math.max(0, Math.round((nextAt.getTime() - now.getTime()) / 60000)) : 0;
    const NowIcon = current ? KIND_ICON[current.kind] : null;
    const todaySpent = sumKrw(expenses.filter((e) => e.spentOn === today.date));

    return (
      <>
        <PhotoHero src={dayPhoto(days, today.date)} alt={`${CITY_NAME[today.city]} 풍경`} top={<HeroTop couple={couple} />}>
          <h1 className="text-[32px] leading-tight">
            Day {index + 1} · {CITY_NAME[today.city]}
          </h1>
          <p className="mono text-[14px] font-semibold opacity-90">
            {formatDate(today.date)} · 현지 {localNow(now, today.tz).time} · {days.length}일 중 {index + 1}일째
          </p>
          <p className="text-[15px] opacity-90">{today.title}</p>
        </PhotoHero>

        <Card className="relative -mt-9 shadow-[0_12px_32px_-12px_rgb(16_19_23/0.25)]">
          <div className="flex items-center gap-2">
            <Badge tone="accent">지금</Badge>
            {current && <span className="mono text-[13px] text-muted">{current.startTime}부터</span>}
          </div>
          {current && NowIcon ? (
            <>
              <div className="mt-3 flex items-start gap-3">
                <IconTile icon={NowIcon} tone="accent" size={44} />
                <div className="min-w-0">
                  <h2 className="text-[20px]">{current.title}</h2>
                  {current.description && <p className="mt-1 line-clamp-3 text-[14px] text-muted">{current.description}</p>}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {current.mapQuery && (
                  <a
                    href={mapUrl(current.mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-surface-2 text-[14px] font-semibold text-fg no-underline"
                  >
                    <MapPin size={18} aria-hidden />
                    지도
                  </a>
                )}
                <Link
                  href={`/expenses/new?itineraryItemId=${current.id}`}
                  className="press flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-control)] bg-accent-soft text-[14px] font-semibold text-accent-ink no-underline"
                >
                  이 일정으로 지출 추가
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-3 text-muted">아직 시작한 일정이 없어요.</p>
          )}
        </Card>

        {next && (
          <Link href={`/itinerary/${next.date}`} className="press flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-fg no-underline">
            <IconTile icon={KIND_ICON[next.kind]} />
            <div className="min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-muted">
                다음 · <span className="mono">{next.startTime}</span> · {untilText(minutes, next, today.date)}
              </span>
              <p className="truncate font-semibold">{next.title}</p>
            </div>
            <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden />
          </Link>
        )}

        <Alerts alerts={today.alerts} />

        <Link href={`/itinerary/${today.date}`} className="press flex items-center justify-between rounded-[var(--radius-card)] bg-surface p-5 text-fg no-underline">
          <div>
            <span className="text-[13px] font-semibold text-muted">오늘 지출</span>
            <p className="mono text-[26px] leading-tight font-bold">{formatKrw(todaySpent)}</p>
          </div>
          <ChevronRight size={22} className="text-muted" aria-hidden />
        </Link>
      </>
    );
  }

  if (before) {
    const dday = daysBetween(localNow(now, first.tz).date, first.date);
    const firstItems = items.filter((i) => i.date === first.date);
    return (
      <>
        <PhotoHero
          src="/images/porto-dusk.webp"
          alt="해 질 녘 포르투 도루강"
          height={340}
          top={<HeroTop couple={couple} />}
        >
          <h1 className="mono text-[52px] leading-none font-bold tracking-tight">D-{dday}</h1>
          <p className="text-[16px] font-semibold">포르투 · 바르셀로나 신혼여행</p>
          <p className="mono text-[14px] opacity-90">2026.11.30 – 12.08 · 8박 9일</p>
        </PhotoHero>

        <Card className="relative -mt-9 shadow-[0_12px_32px_-12px_rgb(16_19_23/0.25)]">
          <Link href="/checklist" className="block text-fg no-underline">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <span className="text-[13px] font-semibold text-muted">출발 준비</span>
                <p className="text-[20px] font-bold">
                  <span className="mono">{done}</span>
                  <span className="text-muted"> / {checklist.length}개 완료</span>
                </p>
              </div>
              <ChevronRight size={22} className="text-muted" aria-hidden />
            </div>
            <ProgressBar value={done} max={checklist.length} tone="ok" label="체크리스트 진행" />
          </Link>
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link href={`/itinerary/${first.date}`} className="-my-2 inline-flex min-h-11 items-center px-1 text-[14px] font-semibold no-underline">
                전체 보기
              </Link>
            }
          >
            첫날 · {first.title}
          </SectionTitle>
          <ol className="flex flex-col">
            {firstItems.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2">
                <IconTile icon={KIND_ICON[i.kind]} size={36} />
                <span className="mono w-12 shrink-0 text-[13px] text-muted">{i.startTime}</span>
                <span className="min-w-0 truncate text-[15px] font-semibold">{i.title}</span>
              </li>
            ))}
          </ol>
        </Card>

        <SummaryTiles s={summary} href="/expenses" />
      </>
    );
  }

  return (
    <>
      <PhotoHero src="/images/barcelona.webp" alt="바르셀로나 사그라다 파밀리아" top={<HeroTop couple={couple} />}>
        <h1 className="text-[32px] leading-tight">여행을 마쳤어요</h1>
        <p className="mono text-[14px] font-semibold opacity-90">
          {formatDate(first.date)} – {formatDate(last.date)}
        </p>
      </PhotoHero>
      <div className="relative -mt-9">
        <SummaryTiles s={summary} href="/expenses" />
      </div>
    </>
  );
}
