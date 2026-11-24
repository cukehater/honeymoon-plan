'use client'

import { LogOut } from 'lucide-react'
import { useTransition } from 'react'

import { logout } from '../api/logout'

export const LogoutButton = () => {
  const [pending, start] = useTransition()
  return (
    <button
      aria-label={pending ? '로그아웃 중' : '로그아웃'}
      className="press inline-flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md disabled:opacity-60"
      disabled={pending}
      type="button"
      onClick={() => {
        if (!confirm('로그아웃할까요?')) return
        start(async () => {
          // 오프라인용으로 저장한 일정·예약 화면(예약번호·주소 포함)도 이 기기에서 지운다
          try {
            await caches.delete('honeymoon-v1')
          } catch {
            // Cache API가 없거나 실패해도 로그아웃은 진행한다
          }
          await logout()
        })
      }}
    >
      <LogOut aria-hidden size={18} />
    </button>
  )
}
