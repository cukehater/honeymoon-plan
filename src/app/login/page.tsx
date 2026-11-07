import { db } from "@/lib/db";
import { LoginForm } from "./login-form";

export const metadata = { title: "로그인" };

export default async function LoginPage() {
  const users = await db.user.findMany({ orderBy: { id: "asc" } });
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-5 py-12">
      <h1 className="text-2xl font-bold">허니문 플래너</h1>
      <LoginForm users={users} />
    </main>
  );
}
