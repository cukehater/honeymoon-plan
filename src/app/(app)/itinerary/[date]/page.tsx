import { DayView } from "@/components/day-view";
import { getSession } from "@/lib/session";

export default async function DayPage({ params }: PageProps<"/itinerary/[date]">) {
  await getSession();
  const { date } = await params;
  return <DayView date={date} />;
}
