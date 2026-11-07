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
      aria-label={pending ? "로그아웃 중" : "로그아웃"}
      className="press inline-flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md disabled:opacity-60"
    >
      <LogOut size={18} aria-hidden />
    </button>
  );
}
