/** @type {import('lint-staged').Configuration} */
const config = {
  // --no-warn-ignored: 커밋된 next-env.d.ts처럼 ignore 대상 파일의 경고가 --max-warnings=0에 걸려 커밋이 막히지 않게 한다
  '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}': [
    'eslint --fix --max-warnings=0 --no-warn-ignored',
    'prettier --write',
  ],
  '*.{json,css,md,yml,yaml}': 'prettier --write',
}

export default config
