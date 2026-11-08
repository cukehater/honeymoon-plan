# 허니문 플래너

포르투·바르셀로나 신혼여행(2026-11-30 ~ 12-08)의 일정, 체크리스트, 경비를 두 사람이 휴대폰으로 함께 보는 웹앱이다. 사용자는 부부 2명뿐이다.

## 먼저 읽을 문서

- `docs/PRD.md`: 요구사항, 화면, 데이터 모델(Prisma 스키마 전문), 계산 규칙, 배포 방법
- `docs/PLAN.md`: 작업 순서와 단계별 완료 조건. 이 순서대로 진행한다.
- `docs/seed-data.json`: 시드 데이터. 일정 54개, 체크리스트 34개, 예약 7건 (예산 21개는 남아 있으나 쓰지 않음)
- `docs/reference/honeymoon.html`: 현재 쓰고 있는 단일 HTML 일정표. 디자인(색, 타이포, 구성)의 기준

## 스택

- Next.js App Router, TypeScript strict, Tailwind CSS
- Prisma ORM 7 + `@prisma/adapter-libsql` + `@libsql/client`
- DB: 로컬은 SQLite 파일(`file:./dev.db`), 운영은 Turso(libSQL)
- Zod(입력 검증), jose(세션 쿠키 서명), Vitest(단위 테스트)
- 배포: Vercel
- 패키지 매니저: pnpm (`package-lock.json` 대신 `pnpm-lock.yaml`)

## 명령어

이 표는 PLAN.md의 Phase 0에서 `package.json` scripts로 맞춰 둔다.

| 명령 | 하는 일 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | `prisma generate` 후 Next.js 빌드 |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm test` | Vitest |
| `pnpm db:migrate` | 로컬 SQLite에 `prisma migrate dev` |
| `pnpm db:seed` | `prisma/seed.ts` 실행 (`TURSO_DATABASE_URL` 기준) |
| `pnpm db:reset` | 로컬 DB 초기화 후 시드 |

## 규칙

**DB와 Prisma**
- 스키마 원본은 `docs/PRD.md`의 Prisma 스키마다. 바꿔야 하면 PRD도 같이 고친다.
- Prisma 클라이언트는 `src/lib/db.ts` 한 곳에서만 만든다(libSQL 어댑터, 개발 중 hot reload 대비 전역 싱글턴).
- Prisma Migrate는 Turso에 직접 쓸 수 없다. 마이그레이션은 로컬 SQLite에서 `prisma migrate dev`로 만들고, 운영 반영은 사용자가 `turso db shell`로 한다. 운영 DB에 명령을 직접 실행하지 않는다.
- Prisma 7은 설정(`prisma.config.ts`), 생성기(`prisma-client`), import 경로가 6과 다르다. 코드를 쓰기 전에 설치된 버전의 공식 문서로 확인한다. 어댑터 클래스 이름도 버전에 따라 다를 수 있으니 패키지의 export를 확인한다.
- SQLite는 enum 값을 강제하지 않는다. 쓰기 전에 반드시 Zod로 검증한다.

**돈과 시간**
- 금액은 정수로만 다룬다. 유로는 센트(`amountMinor`), 원화는 원. 부동소수점 금액 계산 금지.
- 유로 지출은 저장할 때의 환율(`fxRate`)과 원화 금액(`amountKrw`)을 함께 저장한다.
- 경비 집계는 `src/lib/budget.ts`의 순수 함수에서만 계산한다. 화면에서 따로 계산하지 않는다.
- 일정 시각은 현지 시각 문자열이다. 날짜별 시간대는 `TripDay.tz`(`Europe/Lisbon`, `Europe/Madrid`)를 쓴다. "지금"과 "다음 일정" 계산은 이 시간대 기준이다.

**서버 코드**
- 읽기는 Server Component에서 Prisma로 직접 조회한다. 쓰기는 Server Action만 쓴다. `"use server"` 파일은 `src/app/**/actions.ts`.
- 모든 Server Action은 첫 줄에서 세션을 확인하고, Zod로 입력을 검증하고, 끝에 `revalidatePath`를 호출한다.
- 비밀번호, 세션 키, DB 토큰은 환경 변수로만 다룬다. `.env*`는 커밋하지 않는다(`.env.example`만 커밋).
- 여권번호, 카드번호는 어디에도 저장하지 않는다.

**UI**
- 한국어 UI. 원화 `1,544원`, 유로 `€60` 형식. 숫자는 `tabular-nums`.
- 모바일 우선. 375px에서 가로 스크롤 없음, 터치 영역 44px 이상, 하단 탭 바는 `env(safe-area-inset-bottom)`을 반영한다.
- 라이트·다크 모드 모두 지원. 포르투는 코발트 블루, 바르셀로나는 오커(색 값은 reference HTML의 `:root` 토큰).
- 저장 버튼은 로딩 상태를 보여주고, 실패하면 입력값을 유지한 채 다시 시도할 수 있게 한다.

## 작업 방식

- `docs/PLAN.md`의 Phase를 순서대로 진행한다. Phase마다 완료 조건을 확인한 뒤 커밋한다.
- 커밋 전에 `pnpm lint`, `pnpm typecheck`, `pnpm test`를 통과시킨다.
- 범위는 PRD의 P0이다. P1은 PLAN의 마지막 Phase에서만 다룬다.
- 판단이 필요한 사항(디자인 취향, 범위 변경, 운영 DB 작업)은 멈추고 사용자에게 묻는다.
