import { DayView } from "@/components/day-view";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { currentTripDay, localNow } from "@/lib/trip-time";

export const metadata = { title: "일정" };

// 일정 탭 첫 화면: 여행 중이면 오늘, 여행 전이면 첫날, 여행 후면 마지막 날
export default async function ItineraryPage() {
  await getSession();
  const days = await db.tripDay.findMany({ select: { date: true, tz: true }, orderBy: { date: "asc" } });
  const now = new Date();
  const first = days[0];
  const date =
    currentTripDay(days, now)?.date ?? (localNow(now, first.tz).date < first.date ? first.date : days[days.length - 1].date);
  return <DayView date={date} />;
}
