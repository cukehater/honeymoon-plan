<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:team-loop-rules -->

## 프로젝트 구조

- FSD(Feature-Sliced Design). Next.js 라우트(`app/`)는 `src/` 레이어를 재수출만 한다.
- 레이어 import는 아래 방향만: `app → pages → widgets → features → entities → shared`. 같은 레이어 슬라이스끼리 import하지 않는다.
- 슬라이스는 `index.ts`로만 노출한다. 파일·폴더명은 kebab-case.
- 서버 컴포넌트가 기본이다. `'use client'`는 상호작용이 필요한 말단 파일에만 둔다.

## 명령어

- 빠른 검사: `pnpm check` (typecheck, lint, unit test, steiger, knip). 턴을 끝낼 때 Stop 훅이 자동으로 실행한다.
- 전체 검증: `pnpm verify` (check, build, e2e). PR 전에 실행한다.
- 컴파일 확인은 `next build` 대신 next-devtools MCP의 `get_compilation_issues`로 한다.
- 브라우저 확인은 next-dev-loop 스킬로 한다. agent-browser는 프로젝트 의존성이라 `pnpm exec agent-browser`로 실행한다.
- 워크트리를 여러 개 띄울 때는 포트를 나눈다: `PORT=3001 pnpm dev`, `PORT=3001 pnpm test:e2e`.

## 완료 기준 (Definition of Done)

1. `pnpm check` 통과
2. 바뀐 라우트를 next-dev-loop 스킬로 열어 콘솔 에러 0개 확인
3. 새 동작에는 테스트 추가 (로직: Vitest, 사용자 흐름: Playwright `e2e/`)
4. `docs/progress.md`에 한 일과 남은 일 기록
5. 기능 단위 작업이면 `reviewer` 서브에이전트가 PASS

## 금지

- 테스트를 삭제하거나 `skip`·`only`로 통과시키지 않는다.
- `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `any`를 추가하지 않는다. 필요하면 이유를 먼저 묻는다.
- 설정 파일(ESLint, tsconfig, steiger, knip, Vitest, Playwright)의 규칙을 완화하지 않는다.
- 새 의존성을 추가하기 전에 확인을 받는다.
- `.env*`, `pnpm-lock.yaml`, `.git/`은 직접 읽거나 고치지 않는다(훅이 막는다).

## 상태

`docs/progress.md`가 세션을 넘어 이어지는 기억이다. 작업을 시작할 때 읽고, 끝낼 때 완료·진행 중·막힌 것을 갱신한다.

<!-- END:team-loop-rules -->
