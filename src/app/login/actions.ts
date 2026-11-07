"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;
// shortcut: 서버리스 인스턴스마다 따로 센다. 인스턴스가 여러 개면 한도가 느슨해진다(사용자 2명이라 충분).
const fails = new Map<string, { count: number; lockedUntil: number }>();

const LoginInput = z.object({
  passcode: z.string().min(1, "비밀번호를 입력하세요."),
  userId: z.coerce.number().int().positive("사용자를 고르세요."),
});

export type LoginState = { error?: string; userId?: string } | undefined;

function sameSecret(a: string, b: string) {
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(a), hash(b));
}

// 로그인 전 액션이라 세션 확인을 하지 않는다.
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = { passcode: String(formData.get("passcode") ?? ""), userId: String(formData.get("userId") ?? "") };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const now = Date.now();
  const entry = fails.get(ip);
  if (entry && entry.lockedUntil > now) {
    const min = Math.ceil((entry.lockedUntil - now) / 60000);
    return { error: `로그인 시도가 너무 많습니다. ${min}분 뒤에 다시 시도하세요.`, userId: raw.userId };
  }

  const parsed = LoginInput.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, userId: raw.userId };

  const expected = process.env.APP_PASSCODE;
  if (!expected) throw new Error("APP_PASSCODE is not set");
  const user = await db.user.findUnique({ where: { id: parsed.data.userId } });

  if (!user || !sameSecret(parsed.data.passcode, expected)) {
    // 잠금이 풀린 뒤에는 0부터 다시 센다.
    const count = (entry?.lockedUntil === 0 ? entry.count : 0) + 1;
    fails.set(ip, { count, lockedUntil: count >= MAX_FAILS ? now + LOCK_MS : 0 });
    return { error: "비밀번호가 맞지 않습니다.", userId: raw.userId };
  }

  fails.delete(ip);
  await createSession(user.id);
  redirect("/");
}
