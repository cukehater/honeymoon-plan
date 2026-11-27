'use client'

import { useActionState } from 'react'

import { field, input, primaryButton } from '@/shared/ui/form-styles'

import { login, type LoginStateType } from '../api/actions'

export const LoginForm = () => {
  const [state, action, pending] = useActionState<LoginStateType, FormData>(login, undefined)
  return (
    <form action={action} className="flex flex-col gap-5">
      <label className={field}>
        비밀번호
        <input
          required
          autoComplete="current-password"
          className={input}
          name="passcode"
          type="password"
        />
      </label>
      {state?.error && (
        <p className="text-[13px] font-semibold text-warn" role="alert">
          {state.error}
        </p>
      )}
      <button className={primaryButton} disabled={pending} type="submit">
        {pending ? '확인 중…' : '들어가기'}
      </button>
    </form>
  )
}
