import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  // 같은 LAN 폰에서 dev 서버 접속 시 JS 청크가 cross-origin으로 막혀 하이드레이션이 안 된다.
  allowedDevOrigins: ['192.168.*.*'],
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
