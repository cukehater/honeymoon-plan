import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  // 같은 LAN 폰에서 dev 서버 접속 시 JS 청크가 cross-origin으로 막혀 하이드레이션이 안 된다.
  allowedDevOrigins: ['192.168.*.*'],
  // 폰 폭에서 개발 표시기가 홈 오른쪽 위 로그아웃 버튼을 덮는다. 컴파일·런타임 에러 오버레이는 그대로 뜬다.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
