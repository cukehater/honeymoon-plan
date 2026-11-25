import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import checkFile from 'eslint-plugin-check-file'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'

// 단일 앱: '' / 모노레포: 'apps/*/'
const ROOT = ''

const nextRefreshOptions =
  reactRefresh.configs.next.rules['react-refresh/only-export-components'][1]

export default defineConfig([
  globalIgnores([
    '**/.next/**',
    '**/out/**',
    '**/build/**',
    '**/dist/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/.turbo/**',
    '**/next-env.d.ts',
  ]),

  js.configs.recommended,
  // react, react-hooks, jsx-a11y, import, @next/next, @typescript-eslint 플러그인이 여기서 등록된다
  ...nextVitals,
  ...nextTs,
  { settings: { next: { rootDir: ROOT || '.' } } },

  /* 앱 소스: 팀 규칙 */
  {
    files: [
      `${ROOT}{app,pages,src}/**/*.{ts,tsx}`,
      'packages/*/src/**/*.{ts,tsx}',
      `${ROOT}{proxy,middleware,instrumentation,instrumentation-client}.ts`,
    ],
    plugins: {
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      /* Core */
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-nested-ternary': 'warn',
      'no-duplicate-imports': 'warn',
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['../../../*', '../../../../*'],
              message: '깊은 상대 경로 import는 금지됩니다.',
            },
          ],
        },
      ],
      'func-style': ['warn', 'expression', { allowArrowFunctions: true }],

      /* TypeScript */
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'typeLike', format: ['PascalCase'], suffix: ['Type'] },
        { selector: 'typeParameter', format: ['PascalCase'] },
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
        {
          selector: ['property', 'parameterProperty', 'method', 'import'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'typeProperty', modifiers: ['requiresQuotes'], format: null },
      ],

      /* React */
      'react/jsx-key': 'warn',
      'react/no-array-index-key': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-sort-props': [
        'warn',
        { callbacksLast: true, shorthandFirst: true, reservedFirst: true },
      ],
      'react/display-name': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-handler-names': [
        'warn',
        { eventHandlerPrefix: 'handle', eventHandlerPropPrefix: 'on' },
      ],
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/button-has-type': 'error',
      'react/function-component-definition': [
        'warn',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react-refresh/only-export-components': [
        'warn',
        { ...nextRefreshOptions, allowConstantExport: true },
      ],

      /* Import */
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
    },
  },

  /* 공용 Button은 type을 사용하는 쪽에서 받으므로 정적 값을 요구할 수 없다 */
  {
    files: [`${ROOT}src/shared/ui/**/*.tsx`, 'packages/ui/src/**/*.tsx'],
    rules: { 'react/button-has-type': 'off' },
  },

  /* 전역·모듈 타입 보강: 외부가 정한 이름을 그대로 써야 한다 */
  {
    files: [`${ROOT}{app,pages,src}/**/*.d.ts`, 'packages/*/src/**/*.d.ts'],
    rules: { '@typescript-eslint/naming-convention': 'off' },
  },

  /* Next 특수 파일: 함수 선언 관례 허용 */
  {
    files: [
      `${ROOT}app/**/{page,layout,loading,template,error,not-found,global-error,default,forbidden,unauthorized}.{ts,tsx}`,
      `${ROOT}pages/**/*.{ts,tsx}`,
      `${ROOT}{proxy,middleware,instrumentation,instrumentation-client}.ts`,
    ],
    rules: {
      'func-style': 'off',
      'react/function-component-definition': 'off',
    },
  },

  /* 파일·폴더 이름 */
  {
    files: [
      `${ROOT}{app,src}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`,
      'packages/*/src/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}',
    ],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { [`${ROOT}{app,src}/**/*`]: 'KEBAB_CASE', 'packages/*/src/**/*': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { [`${ROOT}{app,src}/**/`]: 'NEXT_JS_APP_ROUTER_CASE', 'packages/*/src/**/': 'KEBAB_CASE' },
      ],
    },
  },

  {
    files: [`${ROOT}pages/**/*.{js,jsx,ts,tsx}`],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          [`${ROOT}pages/**/*`]: '@(_app|_document|_error|+([a-z0-9])*(-+([a-z0-9]))|\\[*\\])',
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { [`${ROOT}pages/**/`]: 'NEXT_JS_APP_ROUTER_CASE' },
      ],
    },
  },

  /* Prettier와 충돌하는 규칙 끔 (항상 마지막) */
  eslintConfigPrettier,
])
