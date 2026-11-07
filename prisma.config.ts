import { defineConfig, env } from "prisma/config";

// Prisma 7 CLI는 .env를 자동으로 읽지 않는다. 먼저 읽은 값이 우선한다(Next.js와 같은 순서).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {}
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
