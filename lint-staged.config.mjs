/** @type {import('lint-staged').Configuration} */
const config = {
  // --no-warn-ignored: globalIgnores 대상 파일이 stage돼도 "File ignored" 경고가 --max-warnings=0에 걸려 커밋이 막히지 않게 한다
  '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}': [
    'eslint --fix --max-warnings=0 --no-warn-ignored',
    'prettier --write',
  ],
  '!(*.{js,jsx,mjs,cjs,ts,tsx,mts,cts})': 'prettier --write --ignore-unknown',
  // 프로젝트 전체 검사. hook이 --hide-all로 unstaged·untracked를 숨기므로 커밋될 내용만 검사한다
  '*': () => ['pnpm typecheck', 'pnpm steiger', 'pnpm knip'],
}

export default config
