import type { BookingKind } from "@/generated/prisma/client";
import { CopyCode } from "@/components/copy-button";
import { mapUrl } from "@/components/day-timeline";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getSession } from "@/lib/session";

export const metadata = { title: "예약" };

const GROUPS: { kind: BookingKind; title: string }[] = [
  { kind: "flight", title: "항공" },
  { kind: "stay", title: "숙소" },
  { kind: "activity", title: "관광" },
];

// "2026-11-30T12:05:00+09:00" → "11/30 (월) 12:05" (적힌 현지 시각 그대로)
function localTime(iso: string) {
  return `${formatDate(iso.slice(0, 10))} ${iso.slice(11, 16)}`;
}

export default async function BookingsPage() {
  await getSession();
  const bookings = await db.booking.findMany({ orderBy: [{ startsAt: "asc" }, { id: "asc" }] });
  return (
    <>
      <h1 className="text-[28px]">예약</h1>
      {GROUPS.map((g) => (
        <section key={g.kind} className="flex flex-col gap-3">
          <h2 className="text-xl">{g.title}</h2>
          {bookings
            .filter((b) => b.kind === g.kind)
            .map((b) => (
              <article key={b.id} className="flex flex-col gap-1.5 rounded-[10px] border border-line bg-surface px-4 py-3.5">
                <h3 className="font-sans text-base font-semibold">{b.title}</h3>
                <p className="mono text-[13px] text-muted">
                  {localTime(b.startsAt)}
                  {b.endsAt && ` → ${localTime(b.endsAt)}`}
                </p>
                {b.refCode && <CopyCode code={b.refCode} />}
                {b.address && (
                  <a href={mapUrl(b.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm">
                    {b.address}
                  </a>
                )}
                {b.phone && (
                  <p className="text-sm">
                    <span className="mono">{b.phone}</span>{" "}
                    <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="ml-2 inline-flex min-h-11 items-center">
                      전화 걸기
                    </a>
                  </p>
                )}
                {b.detail && <p className="text-sm text-muted">{b.detail}</p>}
              </article>
            ))}
        </section>
      ))}
    </>
  );
}
