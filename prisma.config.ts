import { defineConfig } from "prisma/config";

// Prisma 7 CLI는 .env를 자동으로 읽지 않는다. 먼저 읽은 값이 우선한다(Next.js와 같은 순서).
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {}
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // generate(Vercel 빌드)는 URL이 필요 없다. migrate는 로컬 .env의 DATABASE_URL을 쓴다.
  datasource: { url: process.env.DATABASE_URL },
});
