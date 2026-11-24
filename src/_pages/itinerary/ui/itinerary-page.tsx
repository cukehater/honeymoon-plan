import { db } from '@/shared/db'
import { getSession } from '@/shared/lib/session'
import { currentTripDay, localNow } from '@/shared/lib/trip-time'

import { DayView } from './day-view'

export const metadata = { title: '일정' }

// 일정 탭 첫 화면: 여행 중이면 오늘, 여행 전이면 첫날, 여행 후면 마지막 날
export const ItineraryPage = async () => {
  await getSession()
  const days = await db.query.tripDay.findMany({
    columns: { date: true, tz: true },
    orderBy: (d, { asc }) => asc(d.date),
  })
  const now = new Date()
  const first = days[0]
  const date =
    currentTripDay(days, now)?.date ??
    (localNow(now, first.tz).date < first.date ? first.date : days[days.length - 1].date)
  return <DayView date={date} />
}
