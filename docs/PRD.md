# 허니문 플래너 PRD

2026-11-07 기준. 원본은 Claude Docs의 "허니문 플래너 PRD" 문서다.

## 개요와 목표

포르투·바르셀로나 신혼여행(2026.11.30~12.08) 일정을 두 사람이 휴대폰으로 함께 보는 웹앱으로 만들고, 경비는 SQLite DB(Turso)에 기록해 예산 대비 실제 지출을 바로 확인하게 한다. 출발이 11/30이라 **11/27까지 배포**를 마감으로 둔다.

지금 일정은 HTML 페이지 하나(`docs/reference/honeymoon.html`)로 되어 있고, 체크 상태와 경비 수정값이 각자 브라우저에만 저장된다. 그래서 두 사람이 같은 상태를 볼 수 없고, 여행 중 실제 지출을 쌓아 둘 곳이 없다.

**성공 기준**

- 두 사람이 각자 휴대폰에서 같은 일정, 체크리스트, 경비를 본다.
- 지출 한 건을 10초 안에 기록한다(금액, 통화, 항목 3개 입력).
- 총 경비, 1인당 금액, 항목별 예산 대비 실제 지출을 한 화면에서 원화로 본다.
- 출발 전 체크리스트 완료율을 함께 추적한다.

## 사용자와 범위

사용자는 부부 두 사람뿐이다. 회원가입이나 다른 여행 생성은 만들지 않고, 이번 여행 하나만 다룬다. 주 사용 환경은 현지에서 쓰는 휴대폰 브라우저다.

| 구분 | 포함 | 제외 |
| --- | --- | --- |
| 일정 | 8일치 타임라인 조회, 항목 완료 표시, 시간·메모 수정 | 예약 사이트 자동 연동, 동선 자동 최적화 |
| 체크리스트 | 두 사람이 공유하는 체크 상태, 항목 추가 | 푸시 알림 |
| 경비 | 예산 항목, 실제 지출 기록, 환율, 집계, 택스리펀드 기록 | 카드사 내역 자동 가져오기, 실시간 환율 API |
| 예약 정보 | 항공·숙소·관광 예약번호와 주소 | 카드번호, 여권번호 같은 민감정보 저장 |
| 지도 | 장소별 구글 지도 링크 | 페이지 안 지도 임베드 |

## 기능 요구사항

출발 전에 반드시 필요한 것은 P0, 여유가 있으면 하는 것은 P1이다. P0만으로도 여행에서 쓸 수 있어야 한다.

| ID | 기능 | 요구사항 | 우선순위 |
| --- | --- | --- | --- |
| F1 | 대시보드 | 출발까지 남은 일수, 오늘 일정(여행 중에는 현재 시각 기준 다음 항목), 경비 요약, 체크리스트 완료율을 한 화면에 보여준다. | P0 |
| F2 | 일정 타임라인 | 11/30~12/7 날짜별로 시각, 장소, 설명, 태그(예약 필요, 예약 완료, 식사, 항공)를 보여준다. 도시마다 색을 구분한다(포르투, 바르셀로나). | P0 |
| F3 | 주의사항 | 귀국 환승 65분, 12/1 포르투갈 공휴일, 12/6 스페인 공휴일 경고를 해당 날짜 상단에 보여준다. | P0 |
| F4 | 장소 지도 링크 | 일정 항목마다 구글 지도 검색 링크를 열 수 있다. | P0 |
| F5 | 체크리스트 공유 | 6개 그룹(수하물, 여권·항공, 숙소, 예약, 돈·통신·보험, 짐)의 체크 상태를 DB에 저장해 두 사람이 같은 상태를 본다. 누가 언제 체크했는지 남긴다. | P0 |
| F6 | 예산 항목 | 항목별 예산(항공, 숙소, 식비, 관광·투어, 현지 교통, 쇼핑, 기타)을 두고, 결제 완료와 예상을 구분한다. 금액은 유로 또는 원화로 입력한다. | P0 |
| F7 | 지출 기록 | 날짜, 도시, 항목, 금액, 통화(EUR/KRW), 결제수단(카드/현금), 결제한 사람, 메모를 입력한다. 일정 항목·예산 항목과 연결할 수 있다. 수정과 삭제가 된다. | P0 |
| F8 | 환율 | 기본 환율을 설정한다(초기값 €1 = 1,544원). 유로 지출은 기록할 때의 환율을 함께 저장하고, 카드 청구 금액이 나오면 원화 금액을 고칠 수 있다. | P0 |
| F9 | 경비 집계 | 총액, 1인당, 결제 완료/추가 예상, 항목별 예산 대비 실제, 날짜별 지출, 예비비(현지 예상 지출의 비율)를 원화로 보여준다. | P0 |
| F10 | 예약 정보 | 항공 5구간, 숙소 2곳, 사그라다 파밀리아의 예약번호, 시간, 주소, 연락처를 보여주고 번호를 복사할 수 있다. | P0 |
| F11 | 접근 제한 | 공유 비밀번호를 아는 사람만 들어오고, 로그인할 때 사용자(경식/배우자)를 고른다. 검색 엔진에 노출하지 않는다. | P0 |
| F12 | 일정 편집 | 항목의 시간과 메모를 고치고, 항목을 추가하거나 숨긴다. | P1 |
| F13 | 택스리펀드 추적 | 면세 대상 구매에 환급 예상액과 상태(서류 받음, 공항 확인, 환급 완료)를 기록하고, 한국 입국 면세 한도(1인 미화 800달러) 초과 여부를 보여준다. | P1 |
| F14 | 오프라인 읽기 | 한 번 열었던 일정과 예약 정보는 통신이 끊겨도 볼 수 있다(PWA). | P1 |
| F15 | 내보내기 | 지출 내역을 CSV로 내려받는다. | P1 |

## 화면 구성

화면은 8개이고, 하단 탭 바(홈, 일정, 경비, 체크리스트, 예약)로 오간다. 지출 추가 버튼은 모든 화면에 떠 있어서 어디서든 바로 기록할 수 있다.

| 경로 | 화면 | 구성 | 요구사항 |
| --- | --- | --- | --- |
| `/login` | 로그인 | 비밀번호 입력, 사용자 선택 | F11 |
| `/` | 홈 | D-day 또는 여행 n일차, 다음 일정 카드, 오늘 지출 합계, 총 경비 요약, 체크리스트 진행 막대 | F1 |
| `/itinerary` | 일정 전체 | 날짜 칩 스크롤 메뉴, 도시 구분선, 날짜별 타임라인 | F2, F3, F4 |
| `/itinerary/[date]` | 하루 일정 | 그날 주의사항, 항목 목록, 항목별 지도 링크와 지출 추가, 그날 지출 합계 | F2~F4, F7 |
| `/expenses` | 경비 | 요약 타일(결제 완료, 추가 예상, 1인당, 총액), 항목별 예산 대비 실제 막대, 날짜별 지출 목록, 환율·예비비 설정 | F6, F8, F9 |
| `/expenses/new` | 지출 추가 | 금액 숫자패드, 통화 토글(기본 EUR), 항목 칩, 결제수단, 메모. 날짜·도시는 현재 여행일로 자동 입력 | F7 |
| `/checklist` | 체크리스트 | 그룹별 항목, 마감일 표시(예: 에어비앤비 무료 취소 10/31), 체크한 사람 | F5 |
| `/bookings` | 예약 정보 | 항공·숙소·관광 카드, 예약번호 복사 버튼, 주소 지도 링크, 전화번호 | F10 |

디자인은 지금 HTML 페이지를 따른다. 포르투는 코발트 블루, 바르셀로나는 오커로 구분하고, 라이트·다크 모드를 모두 지원한다.

## 데이터 모델

테이블은 10개이고, 경비는 `budget_item`(계획)과 `expense`(실제)로 나눠 두 값을 항목별로 비교한다. 유로 지출은 기록할 때의 환율과 원화 금액을 함께 저장해서, 나중에 기본 환율을 바꿔도 이미 쓴 돈의 원화 금액은 변하지 않는다.

시간은 현지 시각으로 저장하고 날짜마다 시간대를 둔다. 포르투는 `Europe/Lisbon`(UTC+0), 바르셀로나는 `Europe/Madrid`(UTC+1)라 12/4 이동일에 1시간 차이가 생긴다. 다음 일정 계산은 이 시간대를 기준으로 한다.

스키마의 기준은 Prisma 스키마(`prisma/schema.prisma`)다. SQLite에는 날짜·소수 타입이 없어서 현지 날짜는 `'2026-11-30'` 같은 문자열로, 유로 금액은 센트 단위 정수(`amountMinor`)로 저장해 소수점 오차를 막는다. SQLite는 Prisma enum 값을 DB에서 강제하지 않으므로 입력값은 Zod로 한 번 더 검증한다.

```prisma
// prisma/schema.prisma — Prisma ORM 7, SQLite(Turso)

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"   // URL은 prisma.config.ts에서 지정
}

enum City {
  paris
  porto
  barcelona
}

enum Category {
  air
  stay
  food
  tour
  transport
  shopping
  etc
}

enum Currency {
  EUR
  KRW
}

enum ItemKind {
  activity
  meal
  flight
  transfer
  rest
}

enum BookingNeed {
  none
  required
  done
}

enum BookingKind {
  flight
  stay
  activity
}

enum BudgetStatus {
  paid
  estimated
}

enum PayMethod {
  card
  cash
}

enum TaxFreeStatus {
  form
  validated
  refunded
}


// 사용자 2명
model User {
  id              Int             @id
  name            String
  checkedItems    ChecklistItem[]
  paidExpenses    Expense[]       @relation("paidBy")
  createdExpenses Expense[]       @relation("createdBy")
  @@map("app_user")
}

// 여행 날짜 (11/30~12/7, 8행)
model TripDay {
  date   String          @id          // '2026-11-30'
  city   City
  tz     String                       // 'Europe/Lisbon' | 'Europe/Madrid'
  title  String
  note   String?
  alerts DayAlert[]
  items  ItineraryItem[]
  @@map("trip_day")
}

// 날짜별 주의사항 (환승 65분, 공휴일). date가 null이면 여행 전체
model DayAlert {
  id    Int      @id @default(autoincrement())
  date  String?
  day   TripDay? @relation(fields: [date], references: [date])
  title String
  body  String
  @@map("day_alert")
}

model ItineraryItem {
  id          Int         @id @default(autoincrement())
  date        String
  day         TripDay     @relation(fields: [date], references: [date])
  startTime   String      @map("start_time")   // '15:00' 현지 시각
  title       String
  description String?
  kind        ItemKind
  booking     BookingNeed @default(none)
  isKey       Boolean     @default(false) @map("is_key")
  mapQuery    String?     @map("map_query")    // 구글 지도 검색어
  sortOrder   Int         @map("sort_order")
  hidden      Boolean     @default(false)
  expenses    Expense[]
  @@index([date, sortOrder])
  @@map("itinerary_item")
}

model ChecklistGroup {
  id        Int             @id @default(autoincrement())
  title     String
  urgent    Boolean         @default(false)
  sortOrder Int             @map("sort_order")
  items     ChecklistItem[]
  @@map("checklist_group")
}

model ChecklistItem {
  id          Int            @id @default(autoincrement())
  groupId     Int            @map("group_id")
  group       ChecklistGroup @relation(fields: [groupId], references: [id])
  title       String
  detail      String?
  dueAt       DateTime?      @map("due_at")
  checkedById Int?           @map("checked_by")
  checkedBy   User?          @relation(fields: [checkedById], references: [id])
  checkedAt   DateTime?      @map("checked_at")
  sortOrder   Int            @map("sort_order")
  @@map("checklist_item")
}

model Booking {
  id       Int         @id @default(autoincrement())
  kind     BookingKind
  title    String
  refCode  String?     @map("ref_code")
  startsAt String      @map("starts_at")   // 현지 오프셋 포함 ISO 8601
  endsAt   String?     @map("ends_at")
  address  String?
  phone    String?
  detail   String?
  @@map("booking")
}

// 계획: 결제 완료 또는 예상 금액
model BudgetItem {
  id          Int          @id @default(autoincrement())
  category    Category
  title       String
  status      BudgetStatus
  currency    Currency
  amountMinor Int          @map("amount_minor")   // EUR은 센트, KRW는 원
  note        String?
  sortOrder   Int          @map("sort_order")
  expenses    Expense[]
  @@map("budget_item")
}

// 실제 지출
model Expense {
  id              Int            @id @default(autoincrement())
  spentOn         String         @map("spent_on")        // '2026-12-05'
  city            City
  category        Category
  title           String
  currency        Currency
  amountMinor     Int            @map("amount_minor")
  fxRate          Float          @map("fx_rate")         // KRW이면 1
  amountKrw       Int            @map("amount_krw")      // 카드 청구 후 수정 가능
  method          PayMethod
  paidById        Int            @map("paid_by")
  paidBy          User           @relation("paidBy", fields: [paidById], references: [id])
  budgetItemId    Int?           @map("budget_item_id")
  budgetItem      BudgetItem?    @relation(fields: [budgetItemId], references: [id])
  itineraryItemId Int?           @map("itinerary_item_id")
  itineraryItem   ItineraryItem? @relation(fields: [itineraryItemId], references: [id])
  taxFreeMinor    Int?           @map("tax_free_minor")  // P1: 환급 예상액(유로 센트)
  taxFreeStatus   TaxFreeStatus? @map("tax_free_status")
  memo            String?
  createdById     Int            @map("created_by")
  createdBy       User           @relation("createdBy", fields: [createdById], references: [id])
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  @@index([spentOn])
  @@index([category])
  @@map("expense")
}

// 설정: fx_eur_krw = 1544, reserve_pct = 10 (value는 JSON 문자열)
model Setting {
  key   String @id
  value String
  @@map("setting")
}
```

**시드 데이터.** 지금 HTML 페이지 내용을 그대로 옮긴다. 여행 날짜 8행, 일정 항목 54개, 주의사항 3개, 체크리스트 6그룹 34개, 예약 8건, 예산 항목 21개다. 추출본은 `docs/seed-data.json`에 있다. 예산 항목 중 결제 완료는 항공권 2,685,370원, 에어비앤비 478,062원, 카사 푸스터 982,119원, 사그라다 파밀리아 €60(실제 결제액으로 수정 필요)이다. 시드는 `prisma/seed.ts` 하나로 만들고 여러 번 실행해도 같은 결과가 나오게 한다.

여권번호와 카드번호는 어느 테이블에도 저장하지 않는다.

## API와 서버 로직

읽기는 Server Component가 DB를 직접 조회하고, 쓰기는 모두 Server Action으로 처리한다. 별도 REST API는 CSV 내보내기 하나만 둔다. 모든 입력은 Zod로 검증하고, 쓰기 후에는 해당 경로를 `revalidatePath`로 갱신한다.

| 이름 | 종류 | 하는 일 |
| --- | --- | --- |
| `login(passcode, userId)` | Server Action | 비밀번호 확인 후 서명된 세션 쿠키 발급(30일) |
| `toggleChecklistItem(id, checked)` | Server Action | `checked_by`, `checked_at` 기록 또는 비움 |
| `createExpense(input)` | Server Action | 환율 스냅샷과 원화 금액을 계산해 저장 |
| `updateExpense(id, input)` | Server Action | 수정. `amount_krw`를 직접 고치면 재계산하지 않음 |
| `deleteExpense(id)` | Server Action | 삭제(화면에서 한 번 더 확인) |
| `upsertBudgetItem(input)` | Server Action | 예산 항목 추가·수정 |
| `updateSetting(key, value)` | Server Action | 기본 환율, 예비비 비율 변경 |
| `updateItineraryItem(id, input)` | Server Action | P1. 시간·메모·숨김 변경 |
| `GET /api/expenses.csv` | Route Handler | P1. 지출 내역 CSV(UTF-8 BOM, 엑셀 호환) |

**경비 계산 규칙**

1. 유로 지출의 원화 금액 = 금액 × 저장 당시 환율, 원 단위 반올림.
2. 예산 항목의 유로 금액은 조회할 때 현재 기본 환율로 환산한다(아직 쓰지 않은 돈이라서).
3. 항목별 예상 총액 = max(예산, 실제 지출 합계). 실제가 예산을 넘으면 실제를 쓴다.
4. 예비비 = 아직 지출되지 않은 현지 예상 금액 × 예비비 비율. 여행이 끝나면 0이 된다.
5. 총 예상 경비 = 항목별 예상 총액의 합 + 예비비. 1인당 = 총액 ÷ 2.

이 계산은 `lib/budget.ts`의 순수 함수 하나에 모으고 단위 테스트를 붙인다. 기준 테스트 값은 현재 페이지의 예상 총액 약 913만 원(환율 1,544원, 예비비 10%)이다.

## 기술 스택과 배포

Next.js(App Router)와 TypeScript로 만들어 Vercel에 배포하고, DB는 SQLite를 쓴다. Vercel 함수의 파일 시스템은 일시적이라 SQLite 파일에 쓴 내용이 남지 않는다([Vercel 안내](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel)). 그래서 운영에서는 SQLite 호환 호스팅 DB인 Turso(libSQL)를 쓰고, 로컬 개발에서는 같은 스키마로 SQLite 파일을 쓴다.

```
휴대폰 브라우저 ──HTTPS──▶ Vercel · Next.js App Router
                           ├─ Middleware: 세션 쿠키 확인, 없으면 /login
                           ├─ Server Components: 화면 조회 ──읽기──▶ Turso (SQLite)
                           └─ Server Actions: 저장, Zod 검증 ──쓰기──▶ Turso (SQLite)
GitHub 푸시 ──배포──▶ Vercel (main = 운영, PR = 미리보기)
```

| 영역 | 선택 | 메모 |
| --- | --- | --- |
| 프레임워크 | Next.js App Router, TypeScript strict | 조회는 Server Components, 쓰기는 Server Actions |
| DB | SQLite (운영: Turso, 로컬: 파일) | 같은 스키마 |
| ORM | Prisma ORM 7 + `@prisma/adapter-libsql` | 스키마는 `prisma/schema.prisma`, 접속 설정은 `prisma.config.ts`, 클라이언트는 `src/generated/prisma`에 생성 |
| 마이그레이션 | 로컬 SQLite에서 `prisma migrate dev`, 운영은 Turso CLI로 SQL 적용 | Turso에서는 Prisma Migrate를 직접 쓸 수 없다 |
| 입력 검증 | Zod | 폼과 Server Action이 같은 스키마를 쓴다 |
| 스타일 | Tailwind CSS | 지금 페이지의 색을 CSS 변수로 옮긴다 |
| 인증 | 공유 비밀번호 + 서명된 쿠키(`jose`) | 사용자가 2명뿐이라 외부 인증 서비스는 쓰지 않는다 |
| 테스트 | Vitest | `lib/budget.ts` 계산 검증 |
| 배포 | Vercel | main은 운영, PR은 미리보기 |

**환경 변수**

| 이름 | 용도 |
| --- | --- |
| `DATABASE_URL` | Prisma CLI가 마이그레이션을 만들 때 쓰는 로컬 SQLite 주소(`file:./dev.db`) |
| `TURSO_DATABASE_URL` | 앱이 접속하는 DB 주소(`libsql://…`). 로컬 개발에서는 `file:./dev.db` |
| `TURSO_AUTH_TOKEN` | Turso 접속 토큰. 로컬에서는 비워 둠 |
| `APP_PASSCODE` | 두 사람이 공유하는 로그인 비밀번호 |
| `SESSION_SECRET` | 세션 쿠키 서명 키(32바이트 이상 무작위 값) |

**배포 순서**

1. GitHub 저장소를 만들고 Vercel 프로젝트에 연결한다.
2. Turso에서 유럽 리전에 운영 DB와 개발용 DB를 만들고 각각 접속 토큰을 발급한다.
3. Vercel에 환경 변수를 등록한다. Production에는 운영 DB를, Preview에는 개발용 DB를 연결해 미리보기가 실제 경비 기록을 건드리지 않게 한다.
4. Vercel 함수 리전을 DB와 같은 유럽 지역으로 맞춘다.
5. 로컬 SQLite에서 `prisma migrate dev`로 마이그레이션 SQL을 만들고, `turso db shell <DB이름> < prisma/migrations/<폴더>/migration.sql`로 운영 DB에 적용한다. 이어서 `prisma/seed.ts`를 한 번 실행한다.
6. main에 푸시해 배포하고, 두 사람 휴대폰에서 로그인과 지출 기록을 확인한다.

## 비기능 요구사항

가장 중요한 것은 현지의 느린 모바일 데이터에서도 빨리 열리고, 지출을 한 손으로 기록할 수 있는 것이다.

| 항목 | 기준 |
| --- | --- |
| 모바일 | 폭 375px에서 가로 스크롤 없음. 터치 영역 44px 이상. 하단 탭 바는 아이폰 홈 표시줄 영역을 피한다. |
| 성능 | 4G에서 홈 화면 LCP 2.5초 이내. 지출 저장 응답 1초 이내. Turso DB와 Vercel 함수는 같은 유럽 리전에 둔다. |
| 콜드 스타트 | 서버리스 함수의 첫 요청은 늦어질 수 있으니 저장 버튼에 로딩 상태를 보여주고, 실패 시 입력값을 유지한 채 다시 시도하게 한다. |
| 통신 끊김 | P0: 저장 실패를 분명히 알리고 입력값을 잃지 않는다. P1: 일정·예약 화면을 오프라인으로 읽는다. |
| 보안 | 모든 페이지와 Server Action은 세션 쿠키를 확인한다. 쿠키는 httpOnly, Secure, SameSite=Lax. 로그인 5회 실패 시 10분 대기. `robots: noindex`. |
| 개인정보 | 예약번호·주소만 저장하고 여권번호·카드번호는 저장하지 않는다. |
| 백업 | Turso의 시점 복원을 쓴다(플랜별 보존 기간 확인). 여행 끝난 뒤 CSV로 한 번 내보낸다. |
| 언어·표기 | 한국어 UI. 원화는 `1,544원`, 유로는 `€60`처럼 표기한다. 시각은 모두 현지 시각이고 필요하면 한국 시각을 함께 보여준다. |
| 접근성 | 명도 대비 4.5:1 이상, 키보드 포커스 표시, 색만으로 의미를 전달하지 않는다. |
