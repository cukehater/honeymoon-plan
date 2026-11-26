import { ChevronRight, MapPin, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { sumKrw, summarizeExpenses, SummaryTiles } from '@/entities/expense'
import { CITY_NAME, dayPhoto, KIND_ICON, mapUrl } from '@/entities/trip'
import { type DayAlertType, db, type ItineraryItemType } from '@/shared/db'
import { formatDate, formatKrw } from '@/shared/lib/format'
import { getSession } from '@/shared/lib/session'
import { currentTripDay, findNowAndNext, localNow, toInstant } from '@/shared/lib/trip-time'
import { BulletList } from '@/shared/ui/bullet-list'
import { PhotoHero } from '@/shared/ui/photo-hero'
import { Badge, Card, IconTile, ProgressBar, SectionTitle } from '@/shared/ui/primitives'

import { LogoutButton } from './logout-button'

// 개발 중에만 ?now=2026-12-06T14:00:00+01:00 으로 현재 시각을 바꿔 화면을 확인한다
const resolveNow = (param: string | string[] | undefined) => {
  if (process.env.NODE_ENV !== 'production' && typeof param === 'string') {
    const d = new Date(param)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date()
}

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)

// "35분 후", "2시간 10분 후", 다음 날이면 날짜
const untilText = (minutes: number, item: ItineraryItemType, today: string) => {
  if (item.date !== today) return formatDate(item.date)
  if (minutes < 60) return `${minutes}분 후`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}시간${m ? ` ${m}분` : ''} 후`
}

const Alerts = ({ alerts }: { alerts: DayAlertType[] }) => {
  return alerts.map((a) => (
    <div
      key={a.id}
      className="flex gap-3 rounded-[var(--radius-card)] bg-caution-soft p-4 text-[14px] leading-relaxed text-fg"
      role="note"
    >
      <TriangleAlert aria-hidden className="mt-0.5 shrink-0 text-caution" size={20} />
      <p>
        <b className="block text-caution">{a.title}</b>
        {a.body}
      </p>
    </div>
  ))
}

// 사진 위 맨 윗줄: 로그아웃
const HeroTop = () => {
  return (
    <div className="flex items-center justify-end">
      <LogoutButton />
    </div>
  )
}

export const HomePage = async ({ searchParams }: PageProps<'/'>) => {
  await getSession()
  const now = resolveNow((await searchParams).now)
  const [days, items, expenses, checklist] = await Promise.all([
    db.query.tripDay.findMany({ orderBy: (d, { asc }) => asc(d.date), with: { alerts: true } }),
    db.query.itineraryItem.findMany({
      where: (i, { eq }) => eq(i.hidden, false),
      orderBy: (i, { asc }) => [asc(i.date), asc(i.startTime), asc(i.sortOrder)],
    }),
    db.query.expense.findMany({
      columns: { spentOn: true, category: true, amountKrw: true, prepaid: true },
    }),
    db.query.checklistItem.findMany({ columns: { checkedAt: true } }),
  ])
  const summary = summarizeExpenses(expenses)
  const first = days[0]
  const last = days.at(-1)
  if (!first || !last) notFound()
  const today = currentTripDay(days, now)
  const before = !today && localNow(now, first.tz).date < first.date
  const done = checklist.filter((c) => c.checkedAt).length

  if (today) {
    const index = days.indexOf(today)
    const { current, next } = findNowAndNext(days, items, now)
    const nextAt = next
      ? toInstant(next.date, next.startTime, days.find((d) => d.date === next.date)!.tz)
      : null
    const minutes = nextAt ? Math.max(0, Math.round((nextAt.getTime() - now.getTime()) / 60000)) : 0
    const NowIcon = current ? KIND_ICON[current.kind] : null
    const todaySpent = sumKrw(expenses.filter((e) => !e.prepaid && e.spentOn === today.date))

    return (
      <>
        <PhotoHero
          alt={`${CITY_NAME[today.city]} 풍경`}
          src={dayPhoto(days, today.date)}
          top={<HeroTop />}
        >
          <h1 className="text-[32px] leading-tight">
            Day {index + 1} · {CITY_NAME[today.city]}
          </h1>
          <p className="mono text-[14px] font-semibold opacity-90">
            {formatDate(today.date)} · 현지 {localNow(now, today.tz).time} · {days.length}일 중{' '}
            {index + 1}일째
          </p>
          <p className="text-[15px] opacity-90">{today.title}</p>
        </PhotoHero>

        <Card className="relative -mt-9 shadow-[0_12px_32px_-12px_rgb(16_19_23/0.25)]">
          <div className="flex items-center gap-2">
            <Badge tone="accent">지금</Badge>
            {current && (
              <span className="mono text-[13px] text-muted">{current.startTime}부터</span>
            )}
          </div>
          {current && NowIcon ? (
            <>
              <div className="mt-3 flex items-start gap-3">
                <IconTile icon={NowIcon} size={44} tone="accent" />
                <div className="min-w-0">
                  <h2 className="text-[20px]">{current.title}</h2>
                  {current.description && (
                    <div className="mt-1 line-clamp-3 text-[14px] text-muted">
                      <BulletList text={current.description} />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {current.mapQuery && (
                  <a
                    className="press flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-surface-2 text-[14px] font-semibold text-fg no-underline"
                    href={mapUrl(current.mapQuery)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <MapPin aria-hidden size={18} />
                    지도
                  </a>
                )}
                <Link
                  className="press flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-control)] bg-accent-soft text-[14px] font-semibold text-accent-ink no-underline"
                  href={`/expenses/new?itineraryItemId=${current.id}`}
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
          <Link
            className="press flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-fg no-underline"
            href={`/itinerary/${next.date}`}
          >
            <IconTile icon={KIND_ICON[next.kind]} />
            <div className="min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-muted">
                다음 · <span className="mono">{next.startTime}</span> ·{' '}
                {untilText(minutes, next, today.date)}
              </span>
              <p className="truncate font-semibold">{next.title}</p>
            </div>
            <ChevronRight aria-hidden className="shrink-0 text-muted" size={20} />
          </Link>
        )}

        <Alerts alerts={today.alerts} />

        <Link
          className="press flex items-center justify-between rounded-[var(--radius-card)] bg-surface p-5 text-fg no-underline"
          href={`/itinerary/${today.date}`}
        >
          <div>
            <span className="text-[13px] font-semibold text-muted">오늘 지출</span>
            <p className="mono text-[26px] leading-tight font-bold">{formatKrw(todaySpent)}</p>
          </div>
          <ChevronRight aria-hidden className="text-muted" size={22} />
        </Link>
      </>
    )
  }

  if (before) {
    const dday = daysBetween(localNow(now, first.tz).date, first.date)
    const firstItems = items.filter((i) => i.date === first.date)
    return (
      <>
        <PhotoHero
          alt="해 질 녘 포르투 도루강"
          height={340}
          src="/images/porto-dusk.webp"
          top={<HeroTop />}
        >
          <h1 className="mono text-[52px] leading-none font-bold tracking-tight">D-{dday}</h1>
          <p className="text-[16px] font-semibold">포르투 · 바르셀로나 신혼여행</p>
          <p className="mono text-[14px] opacity-90">2026.11.30 – 12.08 · 8박 9일</p>
        </PhotoHero>

        <Card className="relative -mt-9 shadow-[0_12px_32px_-12px_rgb(16_19_23/0.25)]">
          <Link className="block text-fg no-underline" href="/checklist">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <span className="text-[13px] font-semibold text-muted">출발 준비</span>
                <p className="text-[20px] font-bold">
                  <span className="mono">{done}</span>
                  <span className="text-muted"> / {checklist.length}개 완료</span>
                </p>
              </div>
              <ChevronRight aria-hidden className="text-muted" size={22} />
            </div>
            <ProgressBar label="체크리스트 진행" max={checklist.length} tone="ok" value={done} />
          </Link>
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link
                className="-my-2 inline-flex min-h-11 items-center px-1 text-[14px] font-semibold no-underline"
                href={`/itinerary/${first.date}`}
              >
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

        <SummaryTiles href="/expenses" s={summary} />
      </>
    )
  }

  return (
    <>
      <PhotoHero alt="바르셀로나 사그라다 파밀리아" src="/images/barcelona.webp" top={<HeroTop />}>
        <h1 className="text-[32px] leading-tight">여행을 마쳤어요</h1>
        <p className="mono text-[14px] font-semibold opacity-90">
          {formatDate(first.date)} – {formatDate(last.date)}
        </p>
      </PhotoHero>
      <div className="relative -mt-9">
        <SummaryTiles href="/expenses" s={summary} />
      </div>
    </>
  )
}
