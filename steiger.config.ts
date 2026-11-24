import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Next.js 라우트 폴더와 겹치지 않게 접두사를 붙인 레이어의 오탐 제외
    files: ['./src/{_app,_pages}/**'],
    rules: { 'fsd/typo-in-layer-name': 'off' },
  },
])
