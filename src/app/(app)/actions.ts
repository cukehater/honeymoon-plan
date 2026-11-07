"use server";

import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/session";

export async function logout() {
  await getSession();
  await destroySession();
  redirect("/login");
}
