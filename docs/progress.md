# Progress

## 완료

- 2026-11-25 단일 운영자 전환: 로그인은 비밀번호만, `app_user`·`paid_by`·`created_by`·`checked_by` 제거(마이그레이션 0002, Neon 적용), 결제자·1인당 표시 제거. 브라우저로 로그인·체크리스트·지출 CRUD·CSV 확인.
- 2026-11-25 세션 쿠키 `secure`를 production에서만 켜도록 변경(`src/shared/lib/session/session.ts`). dev를 테일스케일 IP(HTTP)로 띄우면 로그인이 유지되지 않던 문제 해결.

## 진행 중

## 막힌 것 / 결정 필요

- 로그인(비밀번호만) e2e 테스트 추가 여부 미정.

- e2e 전수검사(2026-11-25)에서 확인 필요 2건: 환율에 숫자가 아닌 값을 넣으면 zod 영어 원문 오류가 노출됨(`src/_pages/expenses/api/actions.ts:116`), 없는 지출·날짜 경로가 not-found 화면이지만 HTTP 200을 반환함.
