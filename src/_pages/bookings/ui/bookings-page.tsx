import { BedDouble, ExternalLink, Landmark, MapPin, Phone, Plane } from 'lucide-react'

import { mapUrl } from '@/entities/trip'
import { type BookingType, db } from '@/shared/db'
import { formatDate } from '@/shared/lib/format'
import { getSession } from '@/shared/lib/session'
import { CopyCode } from '@/shared/ui/copy-button'
import { IconTile, PageHeader } from '@/shared/ui/primitives'

export const metadata = { title: '예약' }

// "2026-11-30T12:05:00+09:00" → 적힌 현지 날짜·시각 그대로
const dateOf = (iso: string) => formatDate(iso.slice(0, 10))
const timeOf = (iso: string) => iso.slice(11, 16)

// "파리 CDG → 포르투 OPO · AF1516" → 출발, 도착, 편명
const parseFlight = (title: string) => {
  const [route = '', ...rest] = title.split(' · ')
  const [from, to] = route.split('→').map((s) => s.trim())
  return { from, to: to ?? '', flight: rest.join(' · ') }
}

const SiteLink = ({ url }: { url: string }) => {
  return (
    <a
      className="press flex min-h-11 items-center gap-2 text-[14px] font-semibold no-underline"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ExternalLink aria-hidden className="shrink-0" size={18} />
      예약 사이트 열기
    </a>
  )
}

// 탑승권 가장자리 반원 홈
const notch = 'absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-bg'

const FlightPass = ({ b }: { b: BookingType }) => {
  const f = parseFlight(b.title)
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] bg-surface">
      <div className="flex items-center justify-between bg-accent px-5 py-3 text-on-accent">
        <span className="flex items-center gap-2 text-[14px] font-bold">
          <Plane aria-hidden size={18} />
          {f.flight || '항공'}
        </span>
        <span className="mono text-[13px] font-semibold opacity-90">{dateOf(b.startsAt)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 px-5 pt-4 pb-5">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold">{f.from}</p>
          <p className="mono text-[28px] leading-tight font-bold">{timeOf(b.startsAt)}</p>
        </div>
        <Plane aria-hidden className="mb-2 text-muted" size={20} />
        <div className="min-w-0 text-right">
          <p className="truncate text-[15px] font-semibold">{f.to}</p>
          <p className="mono text-[28px] leading-tight font-bold">
            {b.endsAt ? timeOf(b.endsAt) : '–'}
          </p>
          {b.endsAt && b.endsAt.slice(0, 10) !== b.startsAt.slice(0, 10) && (
            <p className="mono text-[12px] font-semibold text-caution">{dateOf(b.endsAt)} 도착</p>
          )}
        </div>
      </div>
      <div aria-hidden className="relative mx-5 border-t border-dashed border-line">
        <span className={`${notch} -left-[30px]`} />
        <span className={`${notch} -right-[30px]`} />
      </div>
      {b.detail && <p className="px-5 py-4 text-[14px] text-muted">{b.detail}</p>}
      {b.url && (
        <div className="px-5 pb-3">
          <SiteLink url={b.url} />
        </div>
      )}
    </article>
  )
}

const StayCard = ({ b }: { b: BookingType }) => {
  return (
    <article className="rounded-[var(--radius-card)] bg-surface">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <IconTile icon={BedDouble} size={44} tone="accent" />
          <h3 className="min-w-0 text-[17px]">{b.title}</h3>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-[14px] bg-surface-2 p-3">
            <dt className="text-[12px] font-semibold text-muted">체크인</dt>
            <dd className="mono text-[15px] font-bold">
              {dateOf(b.startsAt)} {timeOf(b.startsAt)}
            </dd>
          </div>
          {b.endsAt && (
            <div className="rounded-[14px] bg-surface-2 p-3">
              <dt className="text-[12px] font-semibold text-muted">체크아웃</dt>
              <dd className="mono text-[15px] font-bold">
                {dateOf(b.endsAt)} {timeOf(b.endsAt)}
              </dd>
            </div>
          )}
        </dl>
        {b.refCode && <CopyCode code={b.refCode} />}
        {b.address && (
          <a
            className="press flex min-h-11 items-start gap-2 text-[14px] font-semibold no-underline"
            href={mapUrl(b.address)}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MapPin aria-hidden className="mt-0.5 shrink-0" size={18} />
            {b.address}
          </a>
        )}
        {b.phone && (
          <a
            className="press flex min-h-11 items-center gap-2 text-[14px] no-underline"
            href={`tel:${b.phone.replace(/\s/g, '')}`}
          >
            <Phone aria-hidden className="shrink-0" size={18} />
            <span className="mono font-semibold">{b.phone}</span>
            <span className="text-muted">전화 걸기</span>
          </a>
        )}
        {b.detail && <p className="text-[14px] leading-relaxed text-muted">{b.detail}</p>}
        {b.url && <SiteLink url={b.url} />}
      </div>
    </article>
  )
}

const ActivityCard = ({ b }: { b: BookingType }) => {
  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-5">
      <div className="flex items-center gap-3">
        <IconTile icon={Landmark} size={44} tone="ok" />
        <div className="min-w-0">
          <h3 className="text-[17px]">{b.title}</h3>
          <p className="mono text-[14px] font-semibold text-muted">
            {dateOf(b.startsAt)} {timeOf(b.startsAt)}
          </p>
        </div>
      </div>
      {b.refCode && <CopyCode code={b.refCode} />}
      {b.address && (
        <a
          className="press flex min-h-11 items-start gap-2 text-[14px] font-semibold no-underline"
          href={mapUrl(b.address)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MapPin aria-hidden className="mt-0.5 shrink-0" size={18} />
          {b.address}
        </a>
      )}
      {b.detail && (
        <p className="rounded-[14px] bg-ok-soft px-4 py-3 text-[14px] font-semibold text-ok">
          {b.detail}
        </p>
      )}
      {b.url && <SiteLink url={b.url} />}
    </article>
  )
}

export const BookingsPage = async () => {
  await getSession()
  const bookings = await db.query.booking.findMany({
    orderBy: (b, { asc }) => [asc(b.startsAt), asc(b.id)],
  })
  const groups = [
    { title: '항공', list: bookings.filter((b) => b.kind === 'flight'), Card: FlightPass },
    { title: '숙소', list: bookings.filter((b) => b.kind === 'stay'), Card: StayCard },
    { title: '관광', list: bookings.filter((b) => b.kind === 'activity'), Card: ActivityCard },
  ].filter((g) => g.list.length > 0)
  return (
    <>
      <PageHeader title="예약" />
      {groups.map(({ title, list, Card }) => (
        <section key={title} className="flex flex-col gap-3">
          <h2 className="mt-2 text-[17px]">
            {title} <span className="mono text-muted">{list.length}</span>
          </h2>
          {list.map((b) => (
            <Card key={b.id} b={b} />
          ))}
        </section>
      ))}
    </>
  )
}
