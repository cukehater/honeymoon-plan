import Link from "next/link";
import { MapPin, Receipt, Sparkles, TriangleAlert } from "lucide-react";
import { ItemEditor } from "@/app/(app)/itinerary/item-editor";
import type { DayAlert, ItineraryItem, TripDay } from "@/generated/prisma/client";
import { KIND_ICON, KIND_LABEL, mapUrl } from "./travel";
import { Badge } from "./ui";

export function DayAlerts({ alerts }: { alerts: DayAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {alerts.map((a) => (
        <div key={a.id} role="note" className="flex gap-3 rounded-[16px] bg-caution-soft p-4 text-[14px] leading-relaxed">
          <TriangleAlert size={20} className="mt-0.5 shrink-0 text-caution" aria-hidden />
          <p>
            <b className="block text-caution">{a.title}</b>
            {a.body}
          </p>
        </div>
      ))}
    </div>
  );
}

// 하루 일정 항목의 아이콘 버튼(지도·지출·편집)
export const iconAction =
  "press inline-flex size-11 items-center justify-center rounded-full bg-surface-2 text-fg no-underline";

// 하루 일정 타임라인. 항목마다 지도·지출 버튼, 항목을 누르면 시각·메모 편집.
export function DayTimeline({ day }: { day: TripDay & { items: ItineraryItem[] } }) {
  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-5">
      {day.note && <p className="mb-4 rounded-[14px] bg-surface-2 px-4 py-3 text-[14px] text-muted">{day.note}</p>}
      {day.items.length === 0 && <p className="text-[14px] text-muted">이날 보이는 일정이 없어요.</p>}
      <ol className="flex flex-col">
        {day.items.map((item, i) => {
          const I = KIND_ICON[item.kind];
          const last = i === day.items.length - 1;
          return (
            <li key={item.id} className="grid grid-cols-[36px_1fr] gap-x-2.5">
              <span className="relative flex justify-center">
                <span
                  className={`relative z-[1] mt-0.5 flex size-9 items-center justify-center rounded-full ${
                    item.isKey ? "bg-accent text-on-accent" : "bg-surface-2 text-muted"
                  }`}
                >
                  <I size={17} aria-label={KIND_LABEL[item.kind]} />
                </span>
                {!last && <span className="absolute top-10 bottom-0 w-px bg-line" aria-hidden />}
              </span>
              <div className={`flex min-w-0 flex-col gap-1 ${last ? "" : "pb-6"}`}>
                <div className="flex min-h-11 items-center justify-between gap-2">
                  <span className="mono text-[13px] font-semibold text-muted">{item.startTime}</span>
                  <span className="flex gap-1.5">
                    {item.mapQuery && (
                      <a href={mapUrl(item.mapQuery)} target="_blank" rel="noopener noreferrer" className={iconAction} aria-label={`${item.title} 지도`}>
                        <MapPin size={18} aria-hidden />
                      </a>
                    )}
                    <Link href={`/expenses/new?itineraryItemId=${item.id}`} className={iconAction} aria-label={`${item.title} 지출 추가`}>
                      <Receipt size={18} aria-hidden />
                    </Link>
                  </span>
                </div>
                {/* 항목을 누르면 시각·메모 편집이 펼쳐진다 */}
                <ItemEditor item={item}>
                  <ItemText item={item} />
                </ItemEditor>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ItemText({ item }: { item: ItineraryItem }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="flex flex-wrap items-center gap-1.5">
        <span className="text-[15px] font-semibold">{item.title}</span>
        {item.isKey && (
          <Badge tone="accent">
            <Sparkles size={11} className="mr-0.5" aria-hidden />
            하이라이트
          </Badge>
        )}
        {item.booking === "required" && <Badge tone="caution">예약 필요</Badge>}
        {item.booking === "done" && <Badge tone="ok">예약 완료</Badge>}
      </span>
      {item.description && <span className="text-[14px] leading-relaxed text-muted">{item.description}</span>}
    </span>
  );
}
