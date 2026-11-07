# 허니문 플래너

포르투·바르셀로나 신혼여행(2026-11-30 ~ 12-08)의 일정, 체크리스트, 경비를 두 사람이 휴대폰으로 함께 보는 웹앱입니다. 요구사항은 `docs/PRD.md`, 작업 규칙은 `CLAUDE.md`에 있습니다.

## 로컬 개발

```bash
pnpm install
pnpm prisma generate   # src/generated/prisma에 클라이언트 생성 (커밋하지 않음)
cp .env.example .env.local
# .env.local에서 APP_PASSCODE를 바꾸고, SESSION_SECRET에 아래 명령의 출력을 넣는다
openssl rand -hex 32

pnpm db:migrate   # 로컬 SQLite(dev.db)에 마이그레이션 적용
pnpm db:seed      # 시드 데이터 넣기 (이미 있으면 아무것도 하지 않음)
pnpm dev          # http://localhost:3000
```

| 명령 | 하는 일 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | `prisma generate` 후 Next.js 빌드 |
| `pnpm lint` / `pnpm typecheck` | ESLint / 타입 검사 |
| `pnpm test` | Vitest |
| `pnpm db:migrate` | 로컬 SQLite에 `prisma migrate dev` |
| `pnpm db:seed` | `prisma/seed.ts` 실행 (`TURSO_DATABASE_URL` 기준). `--force`는 참고 데이터를 다시 넣는다(지출이 있으면 거부) |
| `pnpm db:reset` | 로컬 DB 초기화 후 시드 |

개발 모드에서는 홈 화면에 `?now=2026-12-06T14:00:00+01:00`처럼 시각을 넘겨 여행 전·중·후 화면을 확인할 수 있습니다.

## 배포

아래 단계는 모두 직접 실행합니다. 운영 DB에 쓰는 명령(4~5단계)은 대상 DB 이름을 한 번 더 확인하고 실행하세요.

### 1. GitHub와 Vercel 연결

1. GitHub 저장소에 푸시합니다.
2. Vercel에서 이 저장소로 프로젝트를 만듭니다. 빌드 명령은 `package.json`의 `build`(`prisma generate && next build`)를 그대로 씁니다.

### 2. Turso DB 만들기

[Turso CLI](https://docs.turso.tech/cli/introduction)를 설치하고 로그인합니다. 운영용과 미리보기용 DB를 유럽 리전에 하나씩 만듭니다. 리전 코드는 `turso db locations`로 확인합니다.

```bash
turso auth login
turso db create honeymoon-prod
turso db create honeymoon-dev

# 접속 주소와 토큰
turso db show honeymoon-prod --url
turso db tokens create honeymoon-prod
turso db show honeymoon-dev --url
turso db tokens create honeymoon-dev
```

### 3. Vercel 환경 변수

Project Settings → Environment Variables에 등록합니다. Production에는 운영 DB, Preview에는 미리보기용 DB를 넣어 미리보기 배포가 실제 경비를 건드리지 않게 합니다.

| 이름 | Production | Preview |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | `honeymoon-prod`의 `libsql://…` 주소 | `honeymoon-dev`의 주소 |
| `TURSO_AUTH_TOKEN` | `honeymoon-prod` 토큰 | `honeymoon-dev` 토큰 |
| `APP_PASSCODE` | 두 사람이 쓸 비밀번호 | 같은 값 또는 별도 값 |
| `SESSION_SECRET` | `openssl rand -hex 32` 출력 | 다른 값 권장 |

`DATABASE_URL`은 로컬 마이그레이션용이라 Vercel에는 필요 없습니다.

Project Settings → Functions에서 함수 리전을 DB와 같은 유럽 지역(예: Frankfurt `fra1`)으로 맞춥니다.

### 4. 스키마 적용

Prisma Migrate는 Turso에 직접 쓸 수 없어서, 로컬에서 만든 마이그레이션 SQL을 Turso CLI로 적용합니다. `prisma/migrations/` 아래 폴더를 오래된 순서대로 적용합니다.

```bash
turso db shell honeymoon-dev  < prisma/migrations/20261107125343_init/migration.sql
turso db shell honeymoon-prod < prisma/migrations/20261107125343_init/migration.sql
```

나중에 스키마를 바꾸면 로컬에서 `pnpm db:migrate --name <이름>`으로 새 폴더를 만들고, 그 폴더의 `migration.sql`만 같은 방법으로 적용합니다.

### 5. 시드

로컬에서 운영 DB 주소와 토큰을 넘겨 한 번 실행합니다. 명령줄에 넘긴 값이 `.env.local`보다 우선합니다. 이미 데이터가 있으면 아무것도 바꾸지 않습니다.

```bash
TURSO_DATABASE_URL="libsql://<honeymoon-dev 주소>"  TURSO_AUTH_TOKEN="<dev 토큰>"  pnpm db:seed
TURSO_DATABASE_URL="libsql://<honeymoon-prod 주소>" TURSO_AUTH_TOKEN="<prod 토큰>" pnpm db:seed
```

### 6. 배포와 확인

1. `main`에 푸시하면 운영 배포, PR을 열면 미리보기 배포가 됩니다.
2. 두 사람 휴대폰에서 각각 로그인하고, 체크리스트 한 항목을 체크해 서로 보이는지 확인합니다.
3. 지출을 한 건 기록해 경비 화면 합계가 바뀌는지 확인한 뒤 삭제합니다.

## 백업

Turso의 시점 복원을 씁니다(플랜별 보존 기간 확인). CSV 내보내기(P1)가 생기면 여행이 끝난 뒤 지출을 한 번 내려받아 둡니다.
