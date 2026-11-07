import Image from "next/image";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { LoginForm } from "./login-form";

export const metadata = { title: "로그인" };

export default async function LoginPage() {
  await connection();
  const users = await db.user.findMany({ orderBy: { id: "asc" } });
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col">
      <div className="relative h-[46dvh] min-h-64">
        <Image src="/images/porto-dusk.webp" alt="해 질 녘 포르투 도루강" fill priority sizes="100vw" className="object-cover" />
        <div className="photo-scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-md flex-col gap-1 px-6 pb-12 text-white">
          <h1 className="text-[32px] leading-tight">허니문 플래너</h1>
          <p className="text-[16px] font-semibold">포르투 · 바르셀로나 신혼여행</p>
          <p className="mono text-[14px] opacity-90">2026.11.30 – 12.08 · 8박 9일</p>
        </div>
      </div>
      <div className="relative -mt-6 flex-1 rounded-t-[28px] bg-surface px-6 pt-8 pb-[calc(32px+env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md">
          <LoginForm users={users} />
        </div>
      </div>
    </main>
  );
}
