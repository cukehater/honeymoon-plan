'use client'

import { Plus } from 'lucide-react'
import { type ReactNode, useState, useTransition } from 'react'

import type { ItemKindType } from '@/shared/db'
import { useSafeAction } from '@/shared/lib/use-safe-action'
import { field, input, primaryButton, secondaryButton } from '@/shared/ui/form-styles'

import { createItineraryItem, setItineraryItemHidden, updateItineraryItem } from '../api/actions'

const submit = `${primaryButton} min-h-11 text-[15px]`

const Message = ({ error }: { error?: string }) => {
  return error ? (
    <p className="text-[13px] font-semibold text-warn" role="alert">
      {error}
    </p>
  ) : null
}

// 숨기기·다시 보이기 버튼
export const HideButton = ({
  id,
  hidden,
  label,
}: {
  id: number
  hidden: boolean
  label: string
}) => {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  return (
    <>
      <button
        className={secondaryButton}
        disabled={pending}
        type="button"
        onClick={() =>
          start(async () => {
            setError('')
            try {
              const r = await setItineraryItemHidden(id, hidden)
              if (r?.error) setError(r.error)
            } catch {
              setError('서버에 연결하지 못했습니다. 다시 시도해 주세요.')
            }
          })
        }
      >
        {pending ? '저장 중…' : label}
      </button>
      <Message error={error} />
    </>
  )
}

export const ItemEditor = ({
  item,
  children,
}: {
  item: { id: number; startTime: string; description: string | null }
  children: ReactNode
}) => {
  const [startTime, setStartTime] = useState(item.startTime)
  const [description, setDescription] = useState(item.description ?? '')
  const [state, action, pending] = useSafeAction(updateItineraryItem)
  return (
    <details className="group">
      <summary className="press -mx-2 cursor-pointer list-none rounded-[12px] px-2 py-1 hover:bg-surface-2 group-open:bg-surface-2 [&::-webkit-details-marker]:hidden">
        {children}
        <span className="sr-only">, 눌러서 시각·메모 편집</span>
      </summary>
      <form action={action} className="mt-3 flex flex-col gap-3">
        <input name="id" type="hidden" value={item.id} />
        <label className={field}>
          시각 (현지)
          <input
            required
            className={`mono ${input}`}
            name="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <label className={field}>
          메모
          <textarea
            className={`${input} py-3`}
            name="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button className={submit} disabled={pending} type="submit">
            {pending ? '저장 중…' : '저장'}
          </button>
          <HideButton hidden id={item.id} label="이 항목 숨기기" />
          {state && !state.error && (
            <span className="text-[13px] font-semibold text-ok" role="status">
              저장했습니다.
            </span>
          )}
        </div>
        <Message error={state?.error} />
      </form>
    </details>
  )
}

const KINDS: { value: ItemKindType; label: string }[] = [
  { value: 'activity', label: '관광' },
  { value: 'meal', label: '식사' },
  { value: 'transfer', label: '이동' },
  { value: 'flight', label: '항공' },
  { value: 'rest', label: '휴식' },
]

export const AddItemForm = ({ date }: { date: string }) => {
  const empty = { startTime: '', title: '', kind: 'activity' as ItemKindType, description: '' }
  const [v, setV] = useState(empty)
  const set = <K extends keyof typeof empty>(k: K, value: (typeof empty)[K]) =>
    setV((s) => ({ ...s, [k]: value }))
  // 성공했을 때만 비운다. 실패하면 입력이 남는다.
  const [state, action, pending] = useSafeAction(async (prev, formData) => {
    const r = await createItineraryItem(prev, formData)
    if (!r?.error) setV(empty)
    return r
  })
  return (
    <details className="rounded-[var(--radius-card)] bg-surface px-5">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 text-[15px] font-semibold text-accent-ink [&::-webkit-details-marker]:hidden">
        <Plus aria-hidden size={18} />
        일정 항목 추가
      </summary>
      <form action={action} className="flex flex-col gap-3 pb-5">
        <input name="date" type="hidden" value={date} />
        <div className="grid grid-cols-2 gap-3">
          <label className={field}>
            시각 (현지)
            <input
              required
              className={`mono ${input}`}
              name="startTime"
              type="time"
              value={v.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            />
          </label>
          <label className={field}>
            종류
            <select
              className={input}
              name="kind"
              value={v.kind}
              onChange={(e) => set('kind', e.target.value as ItemKindType)}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={field}>
          제목
          <input
            required
            className={input}
            maxLength={200}
            name="title"
            value={v.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </label>
        <label className={field}>
          메모
          <textarea
            className={`${input} py-3`}
            name="description"
            rows={2}
            value={v.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </label>
        <div className="flex items-center gap-3">
          <button className={submit} disabled={pending} type="submit">
            {pending ? '저장 중…' : '추가'}
          </button>
          {state && !state.error && (
            <span className="text-[13px] font-semibold text-ok" role="status">
              추가했습니다.
            </span>
          )}
        </div>
        <Message error={state?.error} />
      </form>
    </details>
  )
}
