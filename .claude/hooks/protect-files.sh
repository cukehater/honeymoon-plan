#!/usr/bin/env bash
# PreToolUse(Read|Edit|Write): 비밀값·lockfile·git 내부 파일 접근을 막는다.
# exit 2면 도구 호출이 취소되고 stderr가 에이전트에게 전달된다.
file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input?.file_path??"")}catch{}})')
[ -n "$file" ] || exit 0
name=$(basename "$file")

case "$file" in
  */.git/*) echo "차단: .git 내부 파일은 직접 다루지 않는다. git 명령을 쓴다." >&2; exit 2 ;;
esac
case "$name" in
  .env.example) exit 0 ;;
  .env|.env.*) echo "차단: $name 에는 비밀값이 있다. 필요한 키 이름은 .env.example에서 확인한다." >&2; exit 2 ;;
  pnpm-lock.yaml) echo "차단: lockfile은 pnpm add/remove/install로만 바꾼다." >&2; exit 2 ;;
esac
exit 0
