import { connection } from "next/server";
import { db } from "@/lib/db";
import { LoginForm } from "./login-form";

export const metadata = { title: "로그인" };

export default async function LoginPage() {
  await connection();
  const users = await db.user.findMany({ orderBy: { id: "asc" } });
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-5 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px]">허니문 플래너</h1>
        <p className="text-sm text-muted">
          <b className="font-semibold text-fg">서울</b> → 파리 → <b className="font-semibold text-azul">포르투 4박</b> →{" "}
          <b className="font-semibold text-ocre">바르셀로나 3박</b> → 파리 → <b className="font-semibold text-fg">서울</b>
        </p>
      </div>
      <LoginForm users={users} />
    </main>
  );
}
