import { eq } from 'drizzle-orm'

import { type CategoryType, db, type ItemKindType, itineraryItem } from '@/shared/db'
import { getSession } from '@/shared/lib/session'
import { currentTripDay, localNow } from '@/shared/lib/trip-time'
import { PageHeader } from '@/shared/ui/primitives'

import { createExpense } from '../api/actions'
import { ExpenseForm } from './expense-form'

export const metadata = { title: '지출 추가' }

const CATEGORY_OF_KIND: Record<ItemKindType, CategoryType> = {
  meal: 'food',
  flight: 'air',
  transfer: 'transport',
  activity: 'tour',
  rest: 'etc',
}

export const NewExpensePage = async ({ searchParams }: PageProps<'/expenses/new'>) => {
  await getSession()
  const { itineraryItemId } = await searchParams
  const linkedId = Number(itineraryItemId)
  const [days, item] = await Promise.all([
    db.query.tripDay.findMany({ orderBy: (d, { asc }) => asc(d.date) }),
    Number.isInteger(linkedId) && linkedId > 0
      ? db.query.itineraryItem.findFirst({
          where: eq(itineraryItem.id, linkedId),
          with: { day: true },
        })
      : null,
  ])
  // 날짜·도시: 연결한 일정 → 오늘 여행일 → (여행 전후) 한국 날짜와 첫날 도시
  const today = currentTripDay(days, new Date())
  const spentOn = item?.date ?? today?.date ?? localNow(new Date(), 'Asia/Seoul').date
  const city = item?.day.city ?? today?.city ?? days[0]?.city ?? 'porto'

  return (
    <>
      <PageHeader back={{ href: '/expenses', label: '경비' }} title="지출 추가" />
      <ExpenseForm
        action={createExpense}
        initial={{
          spentOn,
          city,
          category: item ? CATEGORY_OF_KIND[item.kind] : 'food',
          currency: 'EUR',
          amount: '',
          method: 'card',
          itineraryItemId: item?.id ?? null,
          memo: '',
        }}
        itineraryTitle={item?.title}
      />
    </>
  )
}
