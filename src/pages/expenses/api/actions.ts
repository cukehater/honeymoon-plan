'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import {
  CATEGORY_LABEL,
  eurToKrw,
  ExpenseInput,
  FX_EUR_KRW,
  parseAmount,
  resolveAmountKrw,
} from '@/entities/expense'
import { type CategoryType, db, expense, itineraryItem } from '@/shared/db'
import { getSession } from '@/shared/lib/session'

export type FormStateType = { error?: string } | undefined

const Id = z.coerce.number().int().positive()

const revalidateExpenses = (...dates: string[]) => {
  revalidatePath('/expenses')
  revalidatePath('/')
  for (const d of dates) revalidatePath(`/itinerary/${d}`)
}

// 목록에 보일 제목: 연결한 일정 → 항목 이름
const titleFor = async (input: { itineraryItemId: number | null; category: CategoryType }) => {
  if (input.itineraryItemId) {
    const item = await db.query.itineraryItem.findFirst({
      where: eq(itineraryItem.id, input.itineraryItemId),
    })
    if (item) return item.title
  }
  return CATEGORY_LABEL[input.category]
}

const formObject = (formData: FormData) =>
  Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]))

export const createExpense = async (
  _prev: FormStateType,
  formData: FormData,
): Promise<FormStateType> => {
  await getSession()
  const parsed = ExpenseInput.safeParse(formObject(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]!.message }
  const input = parsed.data
  const rate = input.currency === 'EUR' ? FX_EUR_KRW : 1
  try {
    await db.insert(expense).values({
      ...input,
      title: await titleFor(input),
      fxRate: rate,
      amountKrw: input.currency === 'EUR' ? eurToKrw(input.amountMinor, rate) : input.amountMinor,
    })
  } catch {
    return { error: '저장하지 못했습니다. 다시 시도해 주세요.' }
  }
  revalidateExpenses(input.spentOn)
  redirect('/expenses')
}

export const updateExpense = async (
  id: number,
  _prev: FormStateType,
  formData: FormData,
): Promise<FormStateType> => {
  await getSession()
  const expenseId = Id.parse(id)
  const raw = formObject(formData)
  const parsed = ExpenseInput.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]!.message }
  const input = parsed.data
  const typedKrw = raw.amountKrw ? parseAmount(raw.amountKrw, 'KRW') : null
  if (raw.amountKrw && (typedKrw == null || typedKrw <= 0))
    return { error: '원화 금액은 0보다 큰 정수로 입력하세요.' }

  const prev = await db.query.expense.findFirst({ where: eq(expense.id, expenseId) })
  if (!prev) return { error: '지출을 찾을 수 없습니다.' }
  try {
    await db
      .update(expense)
      .set({
        ...input,
        title: await titleFor(input),
        ...resolveAmountKrw(prev, { ...input, amountKrw: typedKrw }, FX_EUR_KRW),
      })
      .where(eq(expense.id, expenseId))
  } catch {
    return { error: '저장하지 못했습니다. 다시 시도해 주세요.' }
  }
  revalidateExpenses(prev.spentOn, input.spentOn)
  redirect('/expenses')
}

export const deleteExpense = async (id: number): Promise<FormStateType> => {
  await getSession()
  const expenseId = Id.parse(id)
  try {
    const [deleted] = await db.delete(expense).where(eq(expense.id, expenseId)).returning()
    if (!deleted) return { error: '지출을 찾지 못했습니다.' }
    revalidateExpenses(deleted.spentOn)
  } catch {
    return { error: '삭제하지 못했습니다. 다시 시도해 주세요.' }
  }
  redirect('/expenses')
}
