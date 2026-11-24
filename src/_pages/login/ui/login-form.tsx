'use client'

import { useActionState } from 'react'

import { field, input, primaryButton } from '@/shared/ui/form-styles'

import { login, type LoginStateType } from '../api/actions'

export const LoginForm = ({ users }: { users: { id: number; name: string }[] }) => {
  const [state, action, pending] = useActionState<LoginStateType, FormData>(login, undefined)
  return (
    <form action={action} className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-muted">누구세요?</legend>
        <div className="flex gap-2">
          {users.map((u) => (
            <label
              key={u.id}
              className="press flex min-h-14 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-control)] bg-surface-2 text-[16px] font-semibold text-muted has-[:checked]:bg-accent-soft has-[:checked]:text-accent-ink has-[:checked]:ring-2 has-[:checked]:ring-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
            >
              <input
                required
                className="sr-only"
                defaultChecked={state?.userId === String(u.id)}
                name="userId"
                type="radio"
                value={u.id}
              />
              {u.name}
            </label>
          ))}
        </div>
      </fieldset>
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
