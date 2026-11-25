// seed-data.json을 DB에 넣는다. 이미 데이터가 있으면 아무것도 하지 않는다.
// --force: 참고 데이터를 지우고 다시 넣는다. 단 Expense가 1건이라도 있으면 거부한다.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { count } from 'drizzle-orm'

import { toMapQuery } from '@/shared/lib/map-query'

import { db } from './client'
import {
  booking,
  type BookingKindType,
  type BookingNeedType,
  budgetItem,
  type BudgetStatusType,
  type CategoryType,
  checklistGroup,
  checklistItem,
  type CityType,
  type CurrencyType,
  dayAlert,
  expense,
  type ItemKindType,
  itineraryItem,
  setting,
  tripDay,
  user,
} from './schema'

type SeedDataType = {
  users: { id: number; name: string }[]
  // eslint-disable-next-line @typescript-eslint/naming-convention -- seed-data.json의 키 이름을 그대로 쓴다
  settings: { fx_eur_krw: number; reserve_pct: number }
  tripDays: { date: string; city: CityType; tz: string; title: string; note: string | null }[]
  dayAlerts: { date: string | null; title: string; body: string }[]
  itineraryItems: {
    date: string
    startTime: string
    title: string
    description: string | null
    kind: ItemKindType
    booking: BookingNeedType
    isKey: boolean
    sortOrder: number
  }[]
  checklistGroups: {
    title: string
    urgent: boolean
    sortOrder: number
    items: {
      title: string
      detail: string | null
      dueNote: string | null
      checked: boolean
      sortOrder: number
    }[]
  }[]
  bookings: {
    kind: BookingKindType
    title: string
    refCode: string | null
    startsAt: string
    endsAt: string | null
    address: string | null
    phone: string | null
    detail: string | null
    url: string | null
  }[]
  budgetItems: {
    category: CategoryType
    title: string
    status: BudgetStatusType
    currency: CurrencyType
    amountMinor: number
    note: string | null
    sortOrder: number
  }[]
}

// "10/31 16:00" → 2026-10-31T16:00:00Z. 날짜 형식이 아니면 null.
const parseDueNote = (note: string): Date | null => {
  const m = /^(\d{1,2})\/(\d{1,2}) (\d{2}):(\d{2})$/.exec(note)
  if (!m) return null
  const [, mo, d, h, mi] = m.map(Number) as [number, number, number, number, number]
  return new Date(Date.UTC(2026, mo - 1, d, h, mi))
}

const main = async () => {
  const force = process.argv.includes('--force')
  const data: SeedDataType = JSON.parse(
    readFileSync(join(import.meta.dirname, 'seed-data.json'), 'utf8'),
  )

  const [days] = await db.select({ n: count() }).from(tripDay)
  if (days!.n > 0) {
    if (!force) {
      // eslint-disable-next-line no-console -- CLI 스크립트의 진행 메시지
      console.log('이미 시드 데이터가 있습니다. 다시 넣으려면 --force')
      return
    }
    const expenses = (await db.select({ n: count() }).from(expense))[0]!.n
    if (expenses > 0) {
      throw new Error(`지출 ${expenses}건이 있어 --force를 거부합니다.`)
    }
  }

  const cityOf = new Map(data.tripDays.map((d) => [d.date, d.city]))
  const now = new Date()

  await db.transaction(async (tx) => {
    if (force) {
      for (const t of [
        checklistItem,
        checklistGroup,
        itineraryItem,
        dayAlert,
        tripDay,
        booking,
        budgetItem,
        setting,
        user,
      ]) {
        await tx.delete(t)
      }
    }

    await tx.insert(user).values(data.users)
    await tx.insert(setting).values([
      { key: 'fx_eur_krw', value: JSON.stringify(data.settings.fx_eur_krw) },
      { key: 'reserve_pct', value: JSON.stringify(data.settings.reserve_pct) },
    ])
    await tx.insert(tripDay).values(data.tripDays)
    await tx.insert(dayAlert).values(data.dayAlerts)
    await tx.insert(itineraryItem).values(
      data.itineraryItems.map((i) => ({
        date: i.date,
        startTime: i.startTime,
        title: i.title,
        description: i.description,
        kind: i.kind,
        booking: i.booking,
        isKey: i.isKey,
        sortOrder: i.sortOrder,
        mapQuery: toMapQuery(i.title, i.kind, cityOf.get(i.date)!),
      })),
    )
    for (const g of data.checklistGroups) {
      const [group] = await tx
        .insert(checklistGroup)
        .values({ title: g.title, urgent: g.urgent, sortOrder: g.sortOrder })
        .returning({ id: checklistGroup.id })
      await tx.insert(checklistItem).values(
        g.items.map((i) => {
          const dueAt = i.dueNote ? parseDueNote(i.dueNote) : null
          const memo = i.dueNote && !dueAt ? i.dueNote : null
          return {
            groupId: group!.id,
            title: i.title,
            detail: memo ? [memo, i.detail].filter(Boolean).join(' · ') : i.detail,
            dueAt,
            checkedById: i.checked ? 1 : null,
            checkedAt: i.checked ? now : null,
            sortOrder: i.sortOrder,
          }
        }),
      )
    }
    await tx.insert(booking).values(data.bookings)
    await tx.insert(budgetItem).values(data.budgetItems)
  })

  // eslint-disable-next-line no-console -- CLI 스크립트의 진행 메시지
  console.log('시드 완료')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$client.end())
