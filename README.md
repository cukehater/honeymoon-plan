# 허니문 플래너

포르투·바르셀로나 신혼여행(2026-11-30 ~ 12-08)의 일정, 체크리스트, 경비를 두 사람이 휴대폰으로 함께 보는 웹앱입니다. 요구사항은 `docs/PRD.md`, 작업 규칙은 `CLAUDE.md`에 있습니다.

## 로컬 개발

로컬과 운영은 같은 Neon DB 하나를 씁니다. 로컬에서 바꾼 데이터가 바로 운영에 보입니다.

```bash
pnpm install
cp .env.example .env.local
# .env.local에 Neon 주소 두 개를 넣고, APP_PASSCODE를 바꾸고, SESSION_SECRET에 아래 명령의 출력을 넣는다
openssl rand -hex 32

pnpm dev          # http://localhost:3000
```

| 명령 | 하는 일 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | Next.js 빌드 |
| `pnpm lint` / `pnpm typecheck` | ESLint / 타입 검사 |
| `pnpm test` | Vitest |
| `pnpm db:generate` | `src/db/schema.ts` 변경을 `drizzle/`에 SQL 마이그레이션으로 생성 |
| `pnpm db:migrate` | `drizzle/` 마이그레이션을 DB에 적용 |
| `pnpm db:seed` | `src/db/seed.ts` 실행 (`DATABASE_URL` 기준). `--force`는 참고 데이터를 다시 넣는다(지출이 있으면 거부) |

개발 모드에서는 홈 화면에 `?now=2026-12-06T14:00:00+01:00`처럼 시각을 넘겨 여행 전·중·후 화면을 확인할 수 있습니다.

## 배포

아래 단계는 모두 직접 실행합니다. DB가 하나뿐이라 4~5단계는 곧 운영 DB에 쓰는 명령입니다.

### 1. GitHub와 Vercel 연결

1. GitHub 저장소에 푸시합니다.
2. Vercel에서 이 저장소로 프로젝트를 만듭니다. 빌드 명령은 `package.json`의 `build`(`next build`)를 그대로 씁니다.

### 2. Neon 프로젝트 만들기

[Neon 콘솔](https://console.neon.tech)에서 유럽 리전(예: Frankfurt)에 프로젝트를 만듭니다. Connection details에서 두 주소를 복사합니다.

- Pooled connection(호스트에 `-pooler`가 붙은 주소): `DATABASE_URL`
- Direct connection: `DATABASE_URL_UNPOOLED`

### 3. 환경 변수

`.env.local`과 Vercel Project Settings → Environment Variables(Production, Preview)에 같은 값을 넣습니다. Vercel 마켓플레이스의 Neon 연동을 쓰면 두 DB 주소는 자동으로 들어갑니다.

| 이름 | 값 |
| --- | --- |
| `DATABASE_URL` | Neon pooled 주소 |
| `DATABASE_URL_UNPOOLED` | Neon direct 주소 (마이그레이션용, 앱 실행에는 안 씀) |
| `APP_PASSCODE` | 두 사람이 쓸 비밀번호 |
| `SESSION_SECRET` | `openssl rand -hex 32` 출력 |

Project Settings → Functions에서 함수 리전을 DB와 같은 유럽 지역(예: Frankfurt `fra1`)으로 맞춥니다.

### 4. 스키마 적용

```bash
pnpm db:migrate
```

나중에 스키마를 바꾸면 `src/db/schema.ts`를 고치고 `pnpm db:generate --name <이름>`으로 `drizzle/`에 SQL을 만든 뒤, 내용을 확인하고 `pnpm db:migrate`로 적용합니다. 스키마를 바로 밀어 넣는 `drizzle-kit push`는 쓰지 않습니다.

### 5. 시드

한 번 실행합니다. 이미 데이터가 있으면 아무것도 바꾸지 않습니다.

```bash
pnpm db:seed
```

### 6. 배포와 확인

1. `main`에 푸시하면 운영 배포, PR을 열면 미리보기 배포가 됩니다. 미리보기도 같은 DB를 씁니다.
2. 두 사람 휴대폰에서 각각 로그인하고, 체크리스트 한 항목을 체크해 서로 보이는지 확인합니다.
3. 지출을 한 건 기록해 경비 화면 합계가 바뀌는지 확인한 뒤 삭제합니다.

## 백업

Neon의 시점 복원을 씁니다(플랜별 보존 기간 확인). 여행이 끝나면 경비 화면의 CSV 내보내기로 지출을 한 번 내려받아 둡니다.
