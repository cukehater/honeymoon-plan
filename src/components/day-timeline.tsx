import Link from "next/link";
import { ItemEditor } from "@/app/(app)/itinerary/item-editor";
import type { City, DayAlert, ItineraryItem, TripDay } from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";

export const CITY_LABEL: Record<City, string> = {
  paris: "파리 · Paris",
  porto: "포르투 · Porto",
  barcelona: "바르셀로나 · Barcelona",
};

// 포르투는 코발트, 바르셀로나는 오커
export const cityText = (city: City) => (city === "barcelona" ? "text-ocre" : "text-azul");
export const citySoft = (city: City) => (city === "barcelona" ? "bg-ocre-soft text-ocre" : "bg-azul-soft text-azul");

export function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function DayAlerts({ alerts }: { alerts: DayAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="flex flex-col gap-2.5">
      {alerts.map((a) => (
        <div key={a.id} role="note" className="rounded-r-lg border-l-[3px] border-warn bg-warn-soft px-4 py-3 text-sm">
          <b className="text-warn">{a.title}</b> {a.body}
        </div>
      ))}
    </div>
  );
}

function Tags({ item, city }: { item: ItineraryItem; city: City }) {
  const tag = "ml-1.5 inline-block rounded px-1.5 align-[2px] text-[11px] font-semibold";
  return (
    <>
      {item.booking === "required" && <span className={`${tag} bg-warn-soft text-warn`}>예약 필요</span>}
      {item.booking === "done" && <span className={`${tag} bg-ok/15 text-ok`}>예약 완료</span>}
      {item.kind === "meal" && <span className={`${tag} ${citySoft(city)}`}>식사</span>}
    </>
  );
}

type Props = {
  day: TripDay & { alerts: DayAlert[]; items: ItineraryItem[] };
  index: number;
  // 하루 일정 화면: 지도 링크와 지출 추가 링크를 보인다
  detail?: boolean;
};

export function DayTimeline({ day, index, detail = false }: Props) {
  return (
    <section id={`d-${day.date}`} className="flex scroll-mt-16 flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
        <span className={`mono rounded px-2 py-0.5 text-[13px] ${citySoft(day.city)}`}>
          {formatDate(day.date)} · D{index}
        </span>
        {detail ? (
          <h1 className="text-2xl">{day.title}</h1>
        ) : (
          <h2 className="text-xl">
            <Link href={`/itinerary/${day.date}`} className="text-fg">
              {day.title}
            </Link>
          </h2>
        )}
      </div>
      <DayAlerts alerts={day.alerts} />
      {day.note && <p className="text-sm text-muted">{day.note}</p>}
      <ol className="flex flex-col">
        {day.items.map((item, i) => {
          const prevKey = i > 0 && day.items[i - 1].isKey;
          return (
            <li
              key={item.id}
              className={`grid grid-cols-[52px_1fr] gap-2.5 py-3 sm:grid-cols-[64px_1fr] sm:gap-3.5 ${
                item.isKey ? "rounded-lg bg-ocre-soft px-3" : i > 0 && !prevKey ? "border-t border-line" : ""
              }`}
            >
              <span className="mono pt-0.5 text-[13px] text-muted">{item.startTime}</span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-semibold">
                  {item.kind === "flight" && (
                    <span className="text-muted" aria-label="항공">
                      ✈{" "}
                    </span>
                  )}
                  {item.title}
                  <Tags item={item} city={day.city} />
                </span>
                {item.description && <span className="text-sm text-muted">{item.description}</span>}
                {detail && (
                  <span className="flex flex-wrap gap-x-4 text-sm">
                    {item.mapQuery && (
                      <a href={mapUrl(item.mapQuery)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center">
                        지도 열기
                      </a>
                    )}
                    <Link href={`/expenses/new?itineraryItemId=${item.id}`} className="inline-flex min-h-11 items-center">
                      이 항목으로 지출 추가
                    </Link>
                    <ItemEditor item={item} />
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
