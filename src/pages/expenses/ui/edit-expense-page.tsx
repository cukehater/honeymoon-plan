import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

import { db, expense as expenseTable } from '@/shared/db'
import { centsToInput } from '@/shared/lib/format'
import { getSession } from '@/shared/lib/session'
import { PageHeader } from '@/shared/ui/primitives'

import { updateExpense } from '../api/actions'
import { ExpenseForm } from './expense-form'

export const metadata = { title: '지출 수정' }

export const EditExpensePage = async ({ params }: PageProps<'/expenses/[id]'>) => {
  await getSession()
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const expense = await db.query.expense.findFirst({
    where: eq(expenseTable.id, id),
    with: { itineraryItem: true },
  })
  if (!expense) notFound()

  return (
    <>
      <PageHeader back={{ href: '/expenses', label: '경비' }} title="지출 수정" />
      <ExpenseForm
        action={updateExpense.bind(null, expense.id)}
        expenseId={expense.id}
        initial={{
          spentOn: expense.spentOn,
          city: expense.city,
          category: expense.category,
          currency: expense.currency,
          amount:
            expense.currency === 'EUR'
              ? centsToInput(expense.amountMinor)
              : String(expense.amountMinor),
          method: expense.method,
          itineraryItemId: expense.itineraryItemId,
          memo: expense.memo ?? '',
          amountKrw: String(expense.amountKrw),
        }}
        itineraryTitle={expense.itineraryItem?.title}
      />
    </>
  )
}
