'use client'

import { useActionState } from 'react'

export type FormStateType = { error?: string } | undefined

// 통신이 끊기면 Server Action이 throw한다. 오류 화면 대신 메시지를 돌려줘 입력을 유지한 채 다시 시도하게 한다.
export const useSafeAction = (
  action: (prev: FormStateType, formData: FormData) => Promise<FormStateType>,
) => {
  return useActionState(async (prev: FormStateType, formData: FormData): Promise<FormStateType> => {
    try {
      return await action(prev, formData)
    } catch {
      return { error: '서버에 연결하지 못했습니다. 연결을 확인하고 다시 저장해 주세요.' }
    }
  }, undefined)
}
