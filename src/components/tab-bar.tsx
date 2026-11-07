"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈" },
  { href: "/itinerary", label: "일정" },
  { href: "/expenses", label: "경비" },
  { href: "/checklist", label: "체크리스트" },
  { href: "/bookings", label: "예약" },
];

export function TabBar() {
  return <TabBarLinks pathname={usePathname()} />;
}

// pathname이 null이면 활성 탭 없이 그린다(Suspense fallback용)
export function TabBarLinks({ pathname }: { pathname: string | null }) {
  // 지출 입력·수정 화면에서는 떠 있는 버튼을 숨긴다
  const showAdd = !/^\/expenses\/.+/.test(pathname ?? "");
  return (
    <>
      {showAdd && (
        <Link
          href="/expenses/new"
          className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 flex min-h-12 items-center rounded-full bg-fg px-5 font-semibold text-bg no-underline shadow-lg"
        >
          + 지출 추가
        </Link>
      )}
      <nav
        aria-label="주 메뉴"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-3xl">
          {TABS.map((t) => {
            const active = t.href === "/" ? pathname === "/" : !!pathname?.startsWith(t.href);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-14 items-center justify-center text-[13px] no-underline ${
                    active
                      ? "font-semibold text-fg before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:rounded-b-full before:bg-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
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
