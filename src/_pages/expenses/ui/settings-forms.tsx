'use client'

import { useState } from 'react'

import { useSafeAction } from '@/shared/lib/use-safe-action'
import { field, input, primaryButton } from '@/shared/ui/form-styles'

import { type FormStateType, updateSetting } from '../api/actions'

const submit = `${primaryButton} min-h-12 text-[15px]`

const Result = ({ state }: { state: FormStateType }) => {
  if (!state) return null
  return state.error ? (
    <p className="text-[13px] font-semibold text-warn" role="alert">
      {state.error}
    </p>
  ) : (
    <p className="text-[13px] font-semibold text-ok" role="status">
      저장했습니다.
    </p>
  )
}

export const SettingForm = ({
  name,
  label,
  unit,
  initial,
}: {
  name: 'fx_eur_krw'
  label: string
  unit: string
  initial: number
}) => {
  const [value, setValue] = useState(String(initial))
  const [state, action, pending] = useSafeAction(updateSetting)
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input name="key" type="hidden" value={name} />
      <label className={`${field} min-w-0 flex-1`}>
        {label}
        <span className="relative flex items-center">
          <input
            className={`mono pr-10 text-right ${input}`}
            inputMode="decimal"
            name="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <span className="pointer-events-none absolute right-4 text-[15px] font-semibold text-muted">
            {unit}
          </span>
        </span>
      </label>
      <button className={submit} disabled={pending} type="submit">
        {pending ? '저장 중…' : '저장'}
      </button>
      <div className="basis-full">
        <Result state={state} />
      </div>
    </form>
  )
}
