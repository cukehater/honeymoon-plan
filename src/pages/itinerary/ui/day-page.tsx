import { getSession } from '@/shared/lib/session'

import { DayView } from './day-view'

export const DayPage = async ({ params }: PageProps<'/itinerary/[date]'>) => {
  await getSession()
  const { date } = await params
  return <DayView date={date} />
}
