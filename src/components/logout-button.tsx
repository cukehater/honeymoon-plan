"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(app)/actions";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("로그아웃할까요?")) return;
        start(async () => {
          // 오프라인용으로 저장한 일정·예약 화면(예약번호·주소 포함)도 이 기기에서 지운다
          try {
            await caches.delete("honeymoon-v1");
          } catch {}
          await logout();
        });
      }}
      className="press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/35 px-3.5 text-[13px] font-semibold text-white backdrop-blur-md disabled:opacity-60"
    >
      <LogOut size={16} aria-hidden />
      {pending ? "나가는 중…" : "로그아웃"}
    </button>
  );
}
