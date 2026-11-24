/** @type {import('lint-staged').Configuration} */
const config = {
  '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{json,css,md,yml,yaml}': 'prettier --write',
}

export default config
