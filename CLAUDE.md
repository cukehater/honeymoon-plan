# 허니문 플래너

포르투·바르셀로나 신혼여행(2026-11-30 ~ 12-08)의 일정, 체크리스트, 경비를 두 사람이 휴대폰으로 함께 보는 웹앱이다. 사용자는 부부 2명뿐이다.

## 먼저 읽을 문서

- `docs/PRD.md`: 요구사항, 화면, 데이터 모델, 계산 규칙, 배포 방법
- `docs/PLAN.md`: 작업 순서와 단계별 완료 조건. 이 순서대로 진행한다.
- `docs/seed-data.json`: 시드 데이터. 일정 51개, 체크리스트 30개, 예약 7건 (예산 21개는 남아 있으나 쓰지 않음)
- `docs/reference/honeymoon.html`: 현재 쓰고 있는 단일 HTML 일정표. 디자인(색, 타이포, 구성)의 기준

## 스택

- Next.js App Router, TypeScript strict, Tailwind CSS
- Drizzle ORM + `drizzle-kit` + `@neondatabase/serverless`
- DB: Neon(Postgres). 로컬 개발과 운영이 같은 DB 하나를 쓴다
- Zod(입력 검증), jose(세션 쿠키 서명), Vitest(단위 테스트)
- 배포: Vercel
- 패키지 매니저: pnpm (`package-lock.json` 대신 `pnpm-lock.yaml`)

## 명령어

이 표는 PLAN.md의 Phase 0에서 `package.json` scripts로 맞춰 둔다.

| 명령 | 하는 일 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | Next.js 빌드 |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm test` | Vitest |
| `pnpm db:generate` | 스키마 변경을 `drizzle/`에 SQL 마이그레이션으로 생성 |
| `pnpm db:migrate` | `drizzle/` 마이그레이션을 DB에 적용 |
| `pnpm db:seed` | `src/db/seed.ts` 실행 (`DATABASE_URL` 기준) |

## 규칙

**DB와 Drizzle**
- 스키마 원본은 `src/db/schema.ts`다. 테이블 타입과 enum 타입도 여기서 export한다.
- Drizzle 클라이언트는 `src/lib/db.ts` 한 곳에서만 만든다(`drizzle-orm/neon-serverless`, 개발 중 hot reload 대비 전역 싱글턴).
- 로컬과 운영이 같은 DB다. 스키마를 바꾸면 `pnpm db:generate`로 마이그레이션 SQL을 만들어 커밋하고, 적용(`pnpm db:migrate`)과 시드는 사용자 확인을 받고 실행한다. `drizzle-kit push`는 쓰지 않는다.
- 쓰기 전에 입력은 반드시 Zod로 검증한다.

**돈과 시간**
- 금액은 정수로만 다룬다. 유로는 센트(`amountMinor`), 원화는 원. 부동소수점 금액 계산 금지.
- 유로 지출은 저장할 때의 환율(`fxRate`)과 원화 금액(`amountKrw`)을 함께 저장한다.
- 경비 집계는 `src/lib/budget.ts`의 순수 함수에서만 계산한다. 화면에서 따로 계산하지 않는다.
- 일정 시각은 현지 시각 문자열이다. 날짜별 시간대는 `TripDay.tz`(`Europe/Lisbon`, `Europe/Madrid`)를 쓴다. "지금"과 "다음 일정" 계산은 이 시간대 기준이다.

**서버 코드**
- 읽기는 Server Component에서 Drizzle로 직접 조회한다. 쓰기는 Server Action만 쓴다. `"use server"` 파일은 `src/app/**/actions.ts`.
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
