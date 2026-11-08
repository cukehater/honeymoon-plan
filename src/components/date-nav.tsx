"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type NavDay = { date: string; label: string; weekday: string; city: string };

// 일정 탭 위쪽 날짜 칩. 지금 보고 있는 날짜는 진하게, 여행 중 오늘은 점으로 표시한다.
export function DateNav({ days, active, today }: { days: NavDay[]; active: string; today: string | null }) {
  const activeRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  return (
    <nav
      aria-label="날짜"
      className="no-scrollbar sticky top-0 z-20 -mx-4 -mt-[max(12px,env(safe-area-inset-top))] flex gap-2 overflow-x-auto bg-bg/90 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 backdrop-blur-xl"
    >
      {days.map((d, i) => {
        const on = d.date === active;
        return (
          <Link
            key={d.date}
            ref={on ? activeRef : undefined}
            href={`/itinerary/${d.date}`}
            aria-current={on ? "page" : undefined}
            className={`press relative flex min-h-11 min-w-[68px] shrink-0 flex-col items-center rounded-[16px] px-3 py-2 no-underline ${
              on ? "bg-fg text-bg" : "bg-surface text-fg"
            }`}
          >
            <span className={`mono text-[11px] font-semibold ${on ? "opacity-80" : "text-muted"}`}>D{i + 1}</span>
            <span className="mono text-[17px] leading-tight font-bold">{d.label}</span>
            <span className={`text-[11px] ${on ? "opacity-80" : "text-muted"}`}>
              {d.weekday} · {d.city}
            </span>
            {d.date === today && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" aria-label="오늘" role="img" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
