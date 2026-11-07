# 구현 계획

`CLAUDE.md`와 `docs/PRD.md`를 먼저 읽고 Phase 0부터 순서대로 진행한다. Phase마다 "완료 조건"을 모두 확인한 뒤 커밋하고 다음 Phase로 넘어간다. Phase 1~7이 P0 범위이고, Phase 8은 P1이다.

## Phase 0. 프로젝트 생성

1. `create-next-app`으로 TypeScript, App Router, Tailwind CSS, ESLint, `src/` 디렉터리, import alias `@/*`를 켜서 만든다.
2. 의존성을 설치한다.
   - 런타임: `@prisma/client`, `@prisma/adapter-libsql`, `@libsql/client`, `zod`, `jose`
   - 개발: `prisma`, `vitest`, `tsx`
3. `tsconfig.json`에 `"strict": true`를 확인한다.
4. `package.json` scripts를 `CLAUDE.md`의 명령어 표대로 만든다. `build`는 `prisma generate && next build`.
5. `.env.example`을 만들고 `.gitignore`에 `.env*`(예외 `.env.example`), `*.db`, `src/generated/`를 넣는다.

```
DATABASE_URL="file:./dev.db"
TURSO_DATABASE_URL="file:./dev.db"
TURSO_AUTH_TOKEN=""
APP_PASSCODE="change-me"
SESSION_SECRET="32바이트 이상 무작위 문자열"
```

**완료 조건**: `npm run dev`로 기본 페이지가 열린다. `npm run lint`, `npm run typecheck`가 통과한다.

## Phase 1. DB 스키마와 시드

1. `prisma/schema.prisma`에 PRD의 스키마를 그대로 옮긴다.
2. `prisma.config.ts`를 만든다. 스키마 경로와 마이그레이션용 URL(`DATABASE_URL`)을 지정한다. 형식은 설치된 Prisma 7 문서를 따른다.
3. `src/lib/db.ts`에 Prisma 클라이언트를 만든다. libSQL 어댑터에 `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`을 넘기고, 개발 모드에서는 `globalThis`에 캐시한다.
4. `npm run db:migrate -- --name init`으로 첫 마이그레이션을 만든다. `prisma/migrations/`는 커밋한다.
5. `prisma/seed.ts`를 만든다. `docs/seed-data.json`을 읽어 아래 규칙으로 넣는다.
   - 실행 순서: `User` → `Setting` → `TripDay` → `DayAlert` → `ItineraryItem` → `ChecklistGroup`/`ChecklistItem` → `Booking` → `BudgetItem`. 하나의 트랜잭션.
   - `TripDay`에 이미 행이 있으면 아무것도 하지 않고 종료한다. `--force`를 주면 참고 데이터를 지우고 다시 넣는다. 단 `Expense`가 1건이라도 있으면 `--force`도 거부한다(실제 지출 보호).
   - `Setting`: `fx_eur_krw`는 `"1544"`, `reserve_pct`는 `"10"`(JSON 문자열).
   - `ItineraryItem.mapQuery`: 항공·휴식 항목은 null. 나머지는 제목에서 `점심: `, `저녁: ` 같은 접두어와 괄호 안 설명을 뺀 장소명에 도시명(`Porto` 또는 `Barcelona`)을 붙인다.
   - `ItineraryItem`: JSON의 `bookingNote`는 컬럼이 없으므로 쓰지 않는다(`booking` 값으로 충분).
   - `ChecklistItem`: JSON의 `checked: true`는 `checkedById = 1`, `checkedAt = 시드 시각`. `dueNote`가 `10/31 16:00`이면 `dueAt = 2026-10-31T16:00:00Z`. 날짜가 아닌 메모(`출발 24~30시간 전`)는 `detail` 앞에 붙인다.
   - `User`: JSON의 이름은 임시값이다(`배우자`). 실제 이름은 사용자에게 확인한다.
6. `npm run db:seed`를 두 번 실행해 두 번째 실행이 아무것도 바꾸지 않는지 확인한다.

**완료 조건**: 로컬 DB의 행 수가 trip_day 8, itinerary_item 54, day_alert 3, checklist_group 6, checklist_item 34, booking 8, budget_item 21, setting 2, app_user 2다.

## Phase 2. 로그인과 접근 제한

1. `src/lib/session.ts`: `jose`로 `{ userId }`를 HS256 서명한 쿠키(`session`, httpOnly, Secure, SameSite=Lax, 30일)를 만들고 검증한다.
2. `/login` 페이지와 `login` Server Action: 비밀번호를 `APP_PASSCODE`와 비교하고, 사용자 2명 중 하나를 고르게 한다. IP 기준 5회 실패 시 10분 동안 거부한다(메모리 기준이면 충분).
3. 세션이 없으면 `/login`으로 보내는 요청 가로채기 파일을 만든다. Next.js 16 이상이면 `proxy.ts`, 그 전 버전이면 `middleware.ts`다. 설치된 버전에 맞춘다.
4. `getSession()` 헬퍼를 만들고 모든 Server Action 첫 줄에서 호출한다.
5. 루트 레이아웃 metadata에 `robots: { index: false, follow: false }`.

**완료 조건**: 로그인하지 않으면 모든 경로가 `/login`으로 간다. 틀린 비밀번호로는 들어갈 수 없다. 로그인 후 새로고침해도 유지된다.

## Phase 3. 레이아웃, 일정, 예약

1. 디자인 토큰: `docs/reference/honeymoon.html`의 `:root` 색 토큰(라이트·다크)과 글꼴(Gowun Batang, IBM Plex Sans KR, IBM Plex Mono)을 `globals.css`와 `next/font`로 옮긴다.
2. 공통 레이아웃: 하단 탭 바(홈, 일정, 경비, 체크리스트, 예약)와 떠 있는 "지출 추가" 버튼. 둘 다 safe-area를 반영한다.
3. `src/lib/format.ts`: `formatKrw(1544) → "1,544원"`, `formatEur(6000) → "€60"`(센트 입력), 날짜 `"12/6 (일)"`.
4. `src/lib/trip-time.ts`: 날짜의 `tz`로 현재 현지 시각을 구하고 "지금 진행 중/다음 일정"을 찾는다. 테스트를 붙인다(12/4 리스본→마드리드 이동일 포함).
5. `/itinerary`: 날짜 칩 메뉴(가로 스크롤), 도시 구분선, 날짜별 타임라인. reference HTML의 구성(시각, 제목, 설명, 태그, 강조 항목)을 따른다.
6. `/itinerary/[date]`: 그날 주의사항 상단 표시, 항목별 구글 지도 링크(`https://www.google.com/maps/search/?api=1&query=` + 인코딩한 `mapQuery`)와 "이 항목으로 지출 추가" 링크, 그날 지출 합계.
7. `/bookings`: 항공·숙소·관광 카드. 예약번호 복사 버튼(`navigator.clipboard` 실패 시 텍스트 선택), 주소 지도 링크, 전화번호는 텍스트로 보이게 하고 `tel:` 링크를 함께 둔다.

**완료 조건**: 54개 항목이 날짜별로 보인다. 12/1, 12/6, 12/7에 주의사항이 보인다. 375px 폭에서 가로 스크롤이 없다. 다크 모드에서 글자가 읽힌다.

## Phase 4. 체크리스트

1. `/checklist`: 그룹 6개, 진행 막대(체크 수/전체), 수하물 그룹 강조, 마감일 표시.
2. `toggleChecklistItem` Server Action: 체크하면 `checkedById`, `checkedAt` 기록, 해제하면 비운다. 화면은 낙관적 업데이트(`useOptimistic`)로 바로 반영한다.
3. 항목 옆에 체크한 사람 이름을 작게 표시한다.

**완료 조건**: 브라우저 두 개에서 다른 사용자로 로그인해, 한쪽에서 체크한 항목이 다른 쪽 새로고침 후 체크돼 보인다.

## Phase 5. 경비

1. `src/lib/budget.ts`: PRD "경비 계산 규칙"을 순수 함수로 구현한다.
   - 입력: 예산 항목 목록, 지출 목록, 환율, 예비비 비율. 출력: 결제 완료 합, 추가 예상 합, 예비비, 총액, 1인당, 항목(category)별 예산·실제·예상, 날짜별 지출 합.
   - 연결 규칙: 지출이 `budgetItemId`를 가지면 그 예산 항목의 실제 지출로 친다. 예산 항목별 예상 = max(예산 원화, 연결된 지출 합). 연결 없는 지출은 그대로 더한다.
   - 예비비 = (유로로 잡힌 `estimated` 예산 중 category가 `air`가 아닌 항목들의 남은 금액 합, 0 미만이면 0) × 비율 × 환율. 남은 금액 = 예산 − 연결된 지출.
   - 모든 원화는 `Math.round`.
2. `src/lib/budget.test.ts`: 시드 데이터, 지출 0건, 환율 1,544원, 예비비 10% 기준으로 아래 값이 나와야 한다.

| 값 | 기대값 |
| --- | --- |
| 결제 완료 | 4,238,191원 (항공 2,685,370 + 에어비앤비 478,062 + 카사 푸스터 982,119 + 사그라다 €60 = 92,640) |
| 추가 예상 (예비비 제외) | 4,507,904원 |
| 예비비 | 380,750원 (현지 예상 €2,466 × 10% × 1,544) |
| 총 예상 경비 | 9,126,845원 |
| 1인당 | 4,563,423원 |

   지출을 넣는 테스트도 추가한다: 예산보다 적게 쓴 경우, 넘게 쓴 경우, 연결 없는 지출, 원화 지출, `amountKrw`를 직접 고친 지출.
3. Zod 스키마 `src/lib/schemas/expense.ts`: 금액은 양수, 유로는 소수 둘째 자리까지 입력받아 센트 정수로 변환.
4. Server Actions: `createExpense`(현재 `fx_eur_krw`로 `fxRate`, `amountKrw` 계산), `updateExpense`(사용자가 `amountKrw`를 직접 고쳤으면 재계산하지 않음), `deleteExpense`, `upsertBudgetItem`, `updateSetting`.
5. `/expenses/new`: 큰 금액 입력(숫자 키패드 `inputMode="decimal"`), 통화 토글(기본 EUR), 항목 칩, 결제수단, 결제한 사람(기본: 로그인 사용자), 메모. 날짜와 도시는 오늘 여행일로 자동 채우고 바꿀 수 있다. 쿼리로 `itineraryItemId`가 오면 연결한다. 저장 실패 시 입력값 유지.
6. `/expenses`: 요약 타일 4개(결제 완료, 추가 예상, 1인당, 총액), 항목별 예산 대비 실제 막대, 날짜별 지출 목록(탭하면 수정), 환율·예비비 설정, 예산 항목 편집.

**완료 조건**: 테스트가 통과한다. 휴대폰 폭에서 지출 한 건을 10초 안에 저장할 수 있다. 저장 후 `/expenses` 합계가 바로 바뀐다.

## Phase 6. 홈

1. 여행 전: D-day(현지 기준 11/30까지), 체크리스트 진행 막대, 경비 요약, 첫날 일정 미리보기.
2. 여행 중: "n일차", 지금/다음 일정 카드(`trip-time.ts`), 오늘 지출 합계, 오늘 주의사항.
3. 여행 후: 최종 경비 요약.
4. 화면 상태를 확인할 수 있게 개발 모드에서만 `?now=2026-12-06T14:00:00+01:00` 같은 시각 덮어쓰기를 지원한다.

**완료 조건**: 세 시점(11/20, 12/6 14:00, 12/9)을 시각 덮어쓰기로 열어 각각 맞는 화면이 나온다.

## Phase 7. 마무리와 배포 준비

1. 접근성 점검: 포커스 표시, 버튼 이름, 명도 대비.
2. 375px, 414px, 데스크톱 폭에서 모든 화면을 확인한다.
3. 오류 화면: `error.tsx`, `not-found.tsx`, DB 연결 실패 시 다시 시도 안내.
4. `README.md`에 배포 절차를 적는다(PRD "배포 순서" 기준). Turso DB 생성, 토큰 발급, Vercel 환경 변수 등록, `turso db shell`로 마이그레이션 적용, 운영 시드 실행은 사용자가 직접 한다. 필요한 명령을 README에 그대로 붙여 넣을 수 있게 정리한다.
5. `npm run build`가 로컬에서 통과하는지 확인한다.

**완료 조건**: `lint`, `typecheck`, `test`, `build`가 모두 통과한다. README만 보고 배포할 수 있다.

## Phase 8. P1 (P0 배포 후 여유가 있을 때)

순서대로 하나씩 하고, 각각 따로 커밋한다.

1. F15 CSV 내보내기: `GET /api/expenses.csv`, UTF-8 BOM, 세션 확인.
2. F12 일정 편집: 시간·메모 수정, 항목 숨김·추가.
3. F13 택스리펀드: 지출에 환급 예상액·상태 입력, 경비 화면에 환급 합계와 1인 미화 800달러 면세 한도 비교.
4. F14 오프라인 읽기: 서비스 워커로 일정·예약 화면 캐시.

## 사용자에게 확인할 것

- 로그인 화면에 쓸 배우자 이름
- `APP_PASSCODE`로 쓸 비밀번호(사용자가 직접 `.env.local`과 Vercel에 넣는다)
