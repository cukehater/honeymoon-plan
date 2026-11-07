import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin, Receipt, Sparkles, TriangleAlert } from "lucide-react";
import { ItemEditor } from "@/app/(app)/itinerary/item-editor";
import type { DayAlert, ItineraryItem, TripDay } from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import { CITY_NAME, CITY_PHOTO, KIND_ICON, KIND_LABEL, mapUrl } from "./travel";
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

type Props = {
  day: TripDay & { alerts: DayAlert[]; items: ItineraryItem[] };
  index: number;
  // 하루 일정 화면: 항목마다 지도·지출·편집 버튼을 보인다
  detail?: boolean;
  // 도시가 바뀌는 첫날: 카드 위에 도시 사진 띠
  cityStart?: boolean;
};

export function DayHeading({ day, index }: { day: TripDay; index: number }) {
  return (
    <span className="mono text-[13px] font-semibold text-muted">
      Day {index + 1} · {formatDate(day.date)} · {CITY_NAME[day.city]}
    </span>
  );
}

export function DayTimeline({ day, index, detail = false, cityStart = false }: Props) {
  return (
    <section id={`d-${day.date}`} className="scroll-mt-24 overflow-hidden rounded-[var(--radius-card)] bg-surface">
      {cityStart && (
        <div className="relative h-28">
          <Image src={CITY_PHOTO[day.city]} alt="" fill priority={index === 0} sizes="(max-width: 576px) 100vw, 576px" className="object-cover" />
          <div className="photo-scrim absolute inset-0" />
          <p className="absolute inset-x-5 bottom-3 text-[22px] font-bold text-white">{CITY_NAME[day.city]}</p>
        </div>
      )}
      <div className="p-5">
        {!detail && (
          <Link href={`/itinerary/${day.date}`} className="mb-4 flex items-start justify-between gap-3 text-fg no-underline">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-[19px]">{day.title}</h2>
              <DayHeading day={day} index={index} />
            </div>
            <ChevronRight size={22} className="mt-1 shrink-0 text-muted" aria-hidden />
          </Link>
        )}
        {day.note && <p className="mb-4 rounded-[14px] bg-surface-2 px-4 py-3 text-[14px] text-muted">{day.note}</p>}
        {!detail && day.alerts.length > 0 && (
          <div className="mb-4">
            <DayAlerts alerts={day.alerts} />
          </div>
        )}
        <ol className="flex flex-col">
          {day.items.map((item, i) => {
            const I = KIND_ICON[item.kind];
            const last = i === day.items.length - 1;
            return (
              <li key={item.id} className={`grid gap-x-2.5 ${detail ? "grid-cols-[36px_1fr]" : "grid-cols-[44px_36px_1fr]"}`}>
                {!detail && <span className="mono pt-2 text-[13px] font-semibold text-muted">{item.startTime}</span>}
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
                <div className={`flex min-w-0 flex-col gap-1 ${detail ? "pt-0" : "pt-1.5"} ${last ? "" : "pb-6"}`}>
                  {detail ? (
                    <>
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
                    </>
                  ) : (
                    <ItemText item={item} />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
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
