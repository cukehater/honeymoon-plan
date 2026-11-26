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

## 진행 중

## 막힌 것 / 결정 필요

- 로그인(비밀번호만) e2e 테스트 추가 여부 미정.

- e2e 전수검사(2026-11-25)에서 확인 필요 1건: 없는 지출·날짜 경로가 not-found 화면이지만 HTTP 200을 반환함.
