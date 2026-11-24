import { MapPin, Receipt, Sparkles, TriangleAlert } from 'lucide-react'
import Link from 'next/link'

import { KIND_ICON, KIND_LABEL, mapUrl } from '@/entities/trip'
import type { DayAlertType, ItineraryItemType, TripDayType } from '@/shared/db'
import { Badge } from '@/shared/ui/primitives'

import { ItemEditor } from './item-editor'

export const DayAlerts = ({ alerts }: { alerts: DayAlertType[] }) => {
  if (alerts.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="flex gap-3 rounded-[16px] bg-caution-soft p-4 text-[14px] leading-relaxed"
          role="note"
        >
          <TriangleAlert aria-hidden className="mt-0.5 shrink-0 text-caution" size={20} />
          <p>
            <b className="block text-caution">{a.title}</b>
            {a.body}
          </p>
        </div>
      ))}
    </div>
  )
}

// 하루 일정 항목의 아이콘 버튼(지도·지출·편집)
const iconAction =
  'press inline-flex size-11 items-center justify-center rounded-full bg-surface-2 text-fg no-underline'

// 하루 일정 타임라인. 항목마다 지도·지출 버튼, 항목을 누르면 시각·메모 편집.
export const DayTimeline = ({ day }: { day: TripDayType & { items: ItineraryItemType[] } }) => {
  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-5">
      {day.note && (
        <p className="mb-4 rounded-[14px] bg-surface-2 px-4 py-3 text-[14px] text-muted">
          {day.note}
        </p>
      )}
      {day.items.length === 0 && (
        <p className="text-[14px] text-muted">이날 보이는 일정이 없어요.</p>
      )}
      <ol className="flex flex-col">
        {day.items.map((item, i) => {
          const I = KIND_ICON[item.kind]
          const last = i === day.items.length - 1
          return (
            <li key={item.id} className="grid grid-cols-[36px_1fr] gap-x-2.5">
              <span className="relative flex justify-center">
                <span
                  className={`relative z-[1] mt-0.5 flex size-9 items-center justify-center rounded-full ${
                    item.isKey ? 'bg-accent text-on-accent' : 'bg-surface-2 text-muted'
                  }`}
                >
                  <I aria-label={KIND_LABEL[item.kind]} size={17} />
                </span>
                {!last && <span aria-hidden className="absolute top-10 bottom-0 w-px bg-line" />}
              </span>
              <div className={`flex min-w-0 flex-col gap-1 ${last ? '' : 'pb-6'}`}>
                <div className="flex min-h-11 items-center justify-between gap-2">
                  <span className="mono text-[13px] font-semibold text-muted">
                    {item.startTime}
                  </span>
                  <span className="flex gap-1.5">
                    {item.mapQuery && (
                      <a
                        aria-label={`${item.title} 지도`}
                        className={iconAction}
                        href={mapUrl(item.mapQuery)}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <MapPin aria-hidden size={18} />
                      </a>
                    )}
                    <Link
                      aria-label={`${item.title} 지출 추가`}
                      className={iconAction}
                      href={`/expenses/new?itineraryItemId=${item.id}`}
                    >
                      <Receipt aria-hidden size={18} />
                    </Link>
                  </span>
                </div>
                {/* 항목을 누르면 시각·메모 편집이 펼쳐진다 */}
                <ItemEditor item={item}>
                  <ItemText item={item} />
                </ItemEditor>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

const ItemText = ({ item }: { item: ItineraryItemType }) => {
  return (
    <span className="flex flex-col gap-1">
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="text-[15px] font-semibold">{item.title}</span>
        {item.isKey && (
          <Badge tone="accent">
            <Sparkles aria-hidden className="mr-0.5" size={11} />
            하이라이트
          </Badge>
        )}
        {item.kind === 'meal' && <Badge>추천</Badge>}
        {item.booking === 'required' && <Badge tone="caution">예약 필요</Badge>}
        {item.booking === 'done' && <Badge tone="ok">예약 완료</Badge>}
      </span>
      {item.description && (
        <span className="text-[14px] leading-relaxed text-muted">{item.description}</span>
      )}
    </span>
  )
}
