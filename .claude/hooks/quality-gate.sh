#!/usr/bin/env bash
# Stop: 턴을 끝내기 전에 pnpm check를 돌린다. 실패하면 종료를 막고 오류를 에이전트에게 넘긴다.
# 이 훅이 없으면 에이전트는 깨진 코드를 두고 "완료"라고 말한다.
input=$(cat)
# 이미 이 훅 때문에 이어서 작업 중이면 통과시킨다. 막으면 무한 루프가 된다.
echo "$input" | grep -q '"stop_hook_active": *true' && exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0
# 코드와 루트 설정(proxy.ts, eslint.config.mjs, package.json 등). 문서만 바뀐 턴은 검사하지 않는다
paths=(app pages src e2e apps packages '*.ts' '*.mts' '*.mjs' '*.json')
[ -z "$(git status --porcelain -- "${paths[@]}" 2>/dev/null)" ] && exit 0

# 마지막 통과 이후 코드가 그대로면(질문에 답만 한 턴) 다시 돌리지 않는다
stamp="$(git rev-parse --git-dir)/quality-gate.pass"
state=$({
  git rev-parse HEAD 2>/dev/null
  git diff HEAD -- "${paths[@]}" 2>/dev/null
  git ls-files -o --exclude-standard -- "${paths[@]}" | while IFS= read -r f; do echo "$f"; cat "$f"; done
} | git hash-object --stdin)
[ "$(cat "$stamp" 2>/dev/null)" = "$state" ] && exit 0

if ! out=$(pnpm -s check 2>&1); then
  echo "품질 게이트 실패. 아래 오류를 고친 뒤 다시 끝낸다. 테스트 skip·규칙 비활성화로 통과시키지 않는다:" >&2
  echo "$out" | grep -v '^[[:space:]]*$' | tail -n 60 >&2
  exit 2
fi
echo "$state" > "$stamp"
exit 0
