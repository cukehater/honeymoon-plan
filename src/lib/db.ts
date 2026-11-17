import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return drizzle({ connection: url, schema });
}

// 개발 중 hot reload마다 연결이 늘지 않도록 전역에 하나만 둔다.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createClient> };

export const db = globalForDb.db ?? createClient();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
