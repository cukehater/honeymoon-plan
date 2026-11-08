import { BedDouble, Landmark, MapPin, Phone, Plane } from "lucide-react";
import { CopyCode } from "@/components/copy-button";
import { mapUrl } from "@/components/travel";
import { IconTile, PageHeader } from "@/components/ui";
import type { Booking } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata = { title: "예약" };

// "2026-11-30T12:05:00+09:00" → 적힌 현지 날짜·시각 그대로
const dateOf = (iso: string) => formatDate(iso.slice(0, 10));
const timeOf = (iso: string) => iso.slice(11, 16);

// "파리 CDG → 포르투 OPO · AF1516" → 출발, 도착, 편명
function parseFlight(title: string) {
  const [route, ...rest] = title.split(" · ");
  const [from, to] = route.split("→").map((s) => s.trim());
  return { from, to: to ?? "", flight: rest.join(" · ") };
}

// 탑승권 가장자리 반원 홈
const notch = "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-bg";

function FlightPass({ b }: { b: Booking }) {
  const f = parseFlight(b.title);
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] bg-surface">
      <div className="flex items-center justify-between bg-accent px-5 py-3 text-on-accent">
        <span className="flex items-center gap-2 text-[14px] font-bold">
          <Plane size={18} aria-hidden />
          {f.flight || "항공"}
        </span>
        <span className="mono text-[13px] font-semibold opacity-90">{dateOf(b.startsAt)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 px-5 pt-4 pb-5">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold">{f.from}</p>
          <p className="mono text-[28px] leading-tight font-bold">{timeOf(b.startsAt)}</p>
        </div>
        <Plane size={20} className="mb-2 text-muted" aria-hidden />
        <div className="min-w-0 text-right">
          <p className="truncate text-[15px] font-semibold">{f.to}</p>
          <p className="mono text-[28px] leading-tight font-bold">{b.endsAt ? timeOf(b.endsAt) : "–"}</p>
          {b.endsAt && b.endsAt.slice(0, 10) !== b.startsAt.slice(0, 10) && (
            <p className="mono text-[12px] font-semibold text-caution">{dateOf(b.endsAt)} 도착</p>
          )}
        </div>
      </div>
      <div className="relative mx-5 border-t border-dashed border-line" aria-hidden>
        <span className={`${notch} -left-[30px]`} />
        <span className={`${notch} -right-[30px]`} />
      </div>
      {b.detail && <p className="px-5 py-4 text-[14px] text-muted">{b.detail}</p>}
    </article>
  );
}

function StayCard({ b }: { b: Booking }) {
  return (
    <article className="rounded-[var(--radius-card)] bg-surface">
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <IconTile icon={BedDouble} tone="accent" size={44} />
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
          <a href={mapUrl(b.address)} target="_blank" rel="noopener noreferrer" className="press flex min-h-11 items-start gap-2 text-[14px] font-semibold no-underline">
            <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden />
            {b.address}
          </a>
        )}
        {b.phone && (
          <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="press flex min-h-11 items-center gap-2 text-[14px] no-underline">
            <Phone size={18} className="shrink-0" aria-hidden />
            <span className="mono font-semibold">{b.phone}</span>
            <span className="text-muted">전화 걸기</span>
          </a>
        )}
        {b.detail && <p className="text-[14px] leading-relaxed text-muted">{b.detail}</p>}
      </div>
    </article>
  );
}

function ActivityCard({ b }: { b: Booking }) {
  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-5">
      <div className="flex items-center gap-3">
        <IconTile icon={Landmark} tone="ok" size={44} />
        <div className="min-w-0">
          <h3 className="text-[17px]">{b.title}</h3>
          <p className="mono text-[14px] font-semibold text-muted">
            {dateOf(b.startsAt)} {timeOf(b.startsAt)}
          </p>
        </div>
      </div>
      {b.refCode && <CopyCode code={b.refCode} />}
      {b.detail && <p className="rounded-[14px] bg-ok-soft px-4 py-3 text-[14px] font-semibold text-ok">{b.detail}</p>}
    </article>
  );
}

export default async function BookingsPage() {
  await getSession();
  const bookings = await db.booking.findMany({ orderBy: [{ startsAt: "asc" }, { id: "asc" }] });
  const groups = [
    { title: "항공", list: bookings.filter((b) => b.kind === "flight"), Card: FlightPass },
    { title: "숙소", list: bookings.filter((b) => b.kind === "stay"), Card: StayCard },
    { title: "관광", list: bookings.filter((b) => b.kind === "activity"), Card: ActivityCard },
  ].filter((g) => g.list.length > 0);
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
  );
}
