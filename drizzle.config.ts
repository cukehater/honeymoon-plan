import { defineConfig } from "drizzle-kit";

// drizzle-kit은 .env를 자동으로 읽지 않는다. 먼저 읽은 값이 우선한다(Next.js와 같은 순서).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {}
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  // migrate는 pooler를 거치지 않는 직접 연결 주소를 쓴다.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
