"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, ListChecks, Plus, Ticket, Wallet } from "lucide-react";

const TABS = [
  { href: "/", label: "홈", icon: House },
  { href: "/itinerary", label: "일정", icon: CalendarDays },
  { href: "/expenses", label: "경비", icon: Wallet },
  { href: "/checklist", label: "체크리스트", icon: ListChecks },
  { href: "/bookings", label: "예약", icon: Ticket },
];

export function TabBar() {
  return <TabBarLinks pathname={usePathname()} />;
}

// pathname이 null이면 활성 탭 없이 그린다(Suspense fallback용)
export function TabBarLinks({ pathname }: { pathname: string | null }) {
  // 지출 입력·수정 화면은 하단 고정 저장 버튼을 쓰므로 탭 바와 떠 있는 버튼을 숨긴다
  if (/^\/expenses\/.+/.test(pathname ?? "")) return null;
  return (
    <>
      <Link
        href="/expenses/new"
        className="press fixed right-[max(1rem,calc(50vw-288px+1rem))] bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-20 flex min-h-13 items-center gap-1.5 rounded-full bg-accent px-5 text-[15px] font-bold text-on-accent no-underline shadow-[0_8px_24px_-6px_rgb(29_99_216/0.55)]"
      >
        <Plus size={20} strokeWidth={2.5} aria-hidden />
        지출 추가
      </Link>
      <nav
        aria-label="주 메뉴"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150"
      >
        <ul className="mx-auto flex max-w-xl">
          {TABS.map((t) => {
            const active = t.href === "/" ? pathname === "/" : !!pathname?.startsWith(t.href);
            const I = t.icon;
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold no-underline ${
                    active ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  <I size={24} strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
