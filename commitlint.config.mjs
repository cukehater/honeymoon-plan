const config = {
  plugins: [
    {
      rules: {
        'subject-korean': ({ subject }) => [
          /[가-힣]/.test(subject ?? ''),
          '설명은 한국어로 작성합니다.',
        ],
      },
    },
  ],
  rules: {
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build', // 빌드·의존성·번들 변경
        'chore', // 기타 작업 (프로덕션 코드 변경 없음)
        'ci', // CI 설정 변경
        'design', // 스타일 변경
        'docs', // 문서만 변경 (README 등)
        'feat', // 새 기능 추가
        'fix', // 버그 수정
        'perf', // 성능 개선
        'refactor', // 리팩토링 (기능·버그 수정 아님)
        'revert', // 이전 커밋 되돌리기
        'style', // 포맷·공백 등 (동작 변경 없음)
        'test', // 테스트 추가·수정
      ],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-korean': [2, 'always'],
    'body-empty': [2, 'always'],
    'footer-empty': [2, 'always'],
  },
}

export default config
