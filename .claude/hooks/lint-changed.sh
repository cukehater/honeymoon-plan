#!/usr/bin/env bash
# PostToolUse(Edit|Write): 방금 고친 파일 하나만 Prettier·ESLint로 고치고, 남은 오류를 에이전트에게 돌려준다.
# exit 2면 stderr가 에이전트에게 전달된다. 맥락이 남아 있을 때 바로 고치게 하려는 것이다.
cd "$CLAUDE_PROJECT_DIR" || exit 0
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input?.file_path??"")}catch{}})')
[ -f "$file" ] || exit 0
case "$file" in */node_modules/*|*/.next/*) exit 0 ;; esac

bin=node_modules/.bin
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.mts|*.cts)
    "$bin/prettier" --write --log-level=silent "$file" >/dev/null 2>&1
    # --no-warn-ignored: ignore 대상 파일의 "File ignored" 경고가 --max-warnings=0에 걸리지 않게 한다
    if ! out=$("$bin/eslint" --fix --max-warnings=0 --no-warn-ignored "$file" 2>&1); then
      echo "ESLint 오류 ($file). 규칙을 끄지 말고 코드를 고친다:" >&2
      echo "$out" | grep -v '^[[:space:]]*$' | tail -n 30 >&2
      exit 2
    fi
    ;;
  *.json|*.css|*.md|*.yml|*.yaml)
    "$bin/prettier" --write --log-level=silent "$file" >/dev/null 2>&1
    ;;
esac
exit 0
