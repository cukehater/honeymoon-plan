# Progress

## 완료

- 2026-11-25 단일 운영자 전환: 로그인은 비밀번호만, `app_user`·`paid_by`·`created_by`·`checked_by` 제거(마이그레이션 0002, Neon 적용), 결제자·1인당 표시 제거. 브라우저로 로그인·체크리스트·지출 CRUD·CSV 확인.
- 2026-11-25 세션 쿠키 `secure`를 production에서만 켜도록 변경(`src/shared/lib/session/session.ts`). dev를 테일스케일 IP(HTTP)로 띄우면 로그인이 유지되지 않던 문제 해결.
- 2026-11-25 dev 서버를 LAN IP(192.168.x.x)로 접속하면 JS 청크가 cross-origin으로 차단돼 체크 등 클릭이 동작하지 않던 문제: `next.config.ts`에 `allowedDevOrigins` 추가.
- 2026-11-26 수기 준비물 메모를 체크리스트 그룹 5개(필수 · 상비, 전자기기, 세면 · 화장품, 옷, 기내 소지품, 항목 38개)로 추가. `seed-data.json`에 반영하고 Neon DB에는 일회성 INSERT(기존 데이터 변경 없음). 브라우저로 표시 확인.
- 2026-11-26 항공 예약 내역 5구간을 시드와 대조: 편명·시각·터미널·환승·타임존 모두 일치. 12/7 공항 이동 설명의 "14시간 비행"을 "12시간 비행"(CDG→ICN 12h20)으로 `seed-data.json`만 수정.
- 2026-11-26 예약 탭 항공권 KE901·KE902 설명에 좌석(38A·38B, 47A·47B) 추가. `seed-data.json` 수정, Neon DB `booking.detail` 2행 일회성 UPDATE.
- 2026-11-26 도루 밸리 투어 예약 설명에 집합·해산, 12/1 그룹 톡 장소 확정, 미니버스 시 08:00 볼사 궁전 안내로 정리(비용 문구 제외). `seed-data.json` 수정, Neon DB `booking.detail` 1행 일회성 UPDATE.
- 2026-11-26 결제 완료 예약 4건(항공 2,685,370원, 포르투 에어비앤비 478,062원, 도루 투어 395,000원, 카사 푸스터 982,119원), 여행자 보험 13,970원, 부엘링 수하물 123,100원, 사그라다 파밀리아 €52(환율 1,500 → 78,000원), 테일러스 74,525원, 렐루 서점 €31.90(47,850원)을 Neon DB `expense`에 일회성 INSERT(카드·원화, 날짜는 이용일). 시드에는 지출 데이터가 없어 반영 안 함.
- 2026-11-26 환율 설정 폼·`updateSetting` 액션·`getSettings` 제거. 유로 환율은 `FX_EUR_KRW = 1500` 상수(`src/entities/expense/model/budget.ts`)로 고정. DB `setting` 테이블과 시드 `settings.fx_eur_krw`는 남아 있으나 앱에서 읽지 않음. `pnpm check` 통과, `/expenses` 브라우저 확인(환율 카드 없음, 에러 0).
- 2026-11-26 `expense.prepaid` 컬럼 추가(마이그레이션 0003, Neon 적용). 사전 결제(항공·수하물·숙소·보험 5건)는 총 지출·항목별에는 포함, 일자별 내역·홈 '오늘 지출'·일정 탭 '이날 지출'(`day-view.tsx`)에서는 제외하고 경비 탭 '사전 결제' 카드로 따로 표시. 입력 폼에는 사전 결제 토글 없음(DB에서만 지정). dev 서버 재시작 후 `/expenses` 브라우저 확인(에러 0).
- 2026-11-26 일정 설명 51개를 줄 단위 불릿으로 재작성(`seed-data.json`, 사실 정보 유지). `src/shared/ui/bullet-list`(`BulletList`, `toBullets` + 테스트) 추가, 일정 타임라인·홈 '지금' 카드에서 점 목록으로 렌더. `pnpm check` 통과. Neon DB `itinerary_item.description` 51행 일회성 UPDATE(12/7 공항 이동의 "14시간 비행"도 새 문구로 교체).
- 2026-11-26 앱 아이콘·파비콘을 "포도송이 하트"(도루 포도알이 모여 하트, 버건디 `#6B1D38` 바탕에 크림 `#FBF3E8`)로 교체: `app/icon.svg`(작은 크기용 12알 버전), `app/favicon.ico`(16·32·48), `app/apple-icon.png`(180), `public/icons/` PWA 4종(any·maskable·monochrome). 화면 안 lucide 아이콘은 그대로. dev 서버(3001)에서 모든 아이콘 경로 200 확인.
- 2026-11-26 체크리스트 정리: '여행자 보험 가입'·'귀국 환승 65분 확인' 체크, '에어비앤비 무료 취소 기한'(기한 지남)·'멀티 어댑터는 필요 없음'(안내성)·'귀국편은 무게 여유 있게'·'카사 푸스터: 특별 요청 남기기'·'7~8착장'·기내 소지품 중복('간단 세안도구', '기초 제품')·'태블릿' 삭제, '여권 · 항공' 그룹(5개) 통째 삭제, '블랙 셔츠'·'블랙 드레스'를 '스냅 의상' 1개로 교체, 렐루·테일러스·도루 설명의 "완료(금액)" 문구 제거. Neon DB 일회성 UPDATE·DELETE(항목 54개). `seed-data.json` 체크리스트를 DB 체크 상태와 일치시킴(스크립트로 대조). `/checklist` 브라우저 확인(에러 0).
- 2026-11-26 일정 구멍 점검(리뷰 서브에이전트 검토) 결과 반영. 식당은 즉흥으로 가기로 해 식당 일정 7개(카자 게데스·타베르나·카페 산티아구·예트먼·카탈라나/타파스 24·세트 포르테스·보케리아 점심)와 포즈 일정 3개(1번 트램·마토지뉴스·포즈 해안)를 숨김(DB `hidden=true`, 시드에서는 삭제, 앱에서 되살릴 수 있음). 12/3을 브런치 09:30 → 크루즈 10:30 → 휴식·단장 13:30 → 커플 스냅 16:00(세하 두 필라르 일몰, 작가 미예약) → 짐 싸기 18:00으로 재구성. 12/1 플로레스 출발 14:30, 12/6 16:45 바르셀로네타 해변 일몰 산책 추가, 12/7 보케리아 월요일 휴무 점포 안내, 12/5 메모의 사그라다 15:15 → 14:45 수정. 체크리스트에 '스냅 작가 · 12/3 16:00' 추가, 유로 현금 €400 이상으로 수정. Neon DB 일회성 UPDATE·INSERT 23건, `seed-data.json` 동기화. `pnpm check` 통과, `/itinerary/2026-12-03`·`2026-12-06` 브라우저 확인(에러 0). 예산(예트먼·세트 포르테스 항목 남음, 스냅·몬세라트 투어 없음)은 손대지 않음.
- 2026-11-27 e2e 전수검사(e2e-regression all) 후속 수정: 홈 D-day를 첫날 tz(리스본) 대신 한국 날짜로 계산(`daysUntil`, `src/shared/lib/trip-time`, 테스트 추가). 한국 0~9시에 하루 밀려 보이던 문제(11/27 00시에 D-4). `next.config.ts`에 `devIndicators: false`: 폰 폭에서 Next.js 개발 표시기가 홈 로그아웃 버튼을 덮음(dev 전용, 에러 오버레이는 유지). `pnpm check` 통과, 브라우저로 D-3·`?now=` 11/29 23:30 KST D-1·11/30 08:00 KST D-0, 로그아웃 실제 클릭 확인(에러 0).
- 2026-11-27 앱 이름을 "허니문 플래너"에서 "Honeymoon Plan"으로 통일: 기본 `<title>`(`root-layout.tsx`), PWA manifest `name`·`short_name`, 로그인 h1, e2e `home.spec.ts`. `pnpm check`·`pnpm test:e2e` 통과, `/login` h1·manifest 응답 확인.
- 2026-11-27 next-preset migrate 재적용: FSD 레이어 `src/_app`·`src/_pages`를 표준 이름 `src/app`·`src/pages`로 변경(`git mv`, 라우트 재수출 `@/app`·`@/pages`), 루트 `pages/README.md` 추가, steiger `typo-in-layer-name` 예외 제거. ESLint(`no-html-link-for-pages`를 루트 `pages/`로 한정)·commitlint·lint-staged(typecheck·steiger·knip을 lint-staged 안에서 커밋될 내용으로 검사)·husky pre-commit을 프리셋으로 교체. knip의 `public/sw.js` 예외는 유지(URL 문자열 등록이라 오탐). lucide-react·vitest·agent-browser·@types/react(-dom) 최신으로. verify.sh 전체 통과, `pnpm test:e2e` 통과, 주요 5개 라우트 브라우저 확인(에러 0).

## 진행 중

## 막힌 것 / 결정 필요

- 로그인(비밀번호만) e2e 테스트 추가 여부 미정.

- e2e 전수검사(2026-11-25)에서 확인 필요 1건: 없는 지출·날짜 경로가 not-found 화면이지만 HTTP 200을 반환함. 2026-11-27 확인: `cacheComponents` 사용 시 요청 시점 DB 조회 후 `notFound()`는 셸 전송 뒤라 200 유지가 Next.js 16 동작(`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md` Status codes). `noindex`는 자동 삽입. 고치려면 proxy에서 DB 조회 후 404 또는 cacheComponents 해제 필요 → 보류.
- 지출 추가 도시 기본값이 일정 항목이 아니라 그날 도시를 따름(11/30 CDG 환승도 포르투). 항목별 도시 정보가 없어 보류.
