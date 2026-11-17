import { eq } from "drizzle-orm";
import { itineraryItem, type Category, type ItemKind } from "@/db/schema";
import { PageHeader } from "@/components/ui";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { currentTripDay, localNow } from "@/lib/trip-time";
import { createExpense } from "../actions";
import { ExpenseForm } from "../expense-form";

export const metadata = { title: "지출 추가" };

const CATEGORY_OF_KIND: Record<ItemKind, Category> = {
  meal: "food",
  flight: "air",
  transfer: "transport",
  activity: "tour",
  rest: "etc",
};

export default async function NewExpensePage({ searchParams }: PageProps<"/expenses/new">) {
  const { userId } = await getSession();
  const { itineraryItemId } = await searchParams;
  const linkedId = Number(itineraryItemId);
  const [users, days, item] = await Promise.all([
    db.query.user.findMany({ orderBy: (u, { asc }) => asc(u.id) }),
    db.query.tripDay.findMany({ orderBy: (d, { asc }) => asc(d.date) }),
    Number.isInteger(linkedId) && linkedId > 0
      ? db.query.itineraryItem.findFirst({ where: eq(itineraryItem.id, linkedId), with: { day: true } })
      : null,
  ]);
  // 날짜·도시: 연결한 일정 → 오늘 여행일 → (여행 전후) 한국 날짜와 첫날 도시
  const today = currentTripDay(days, new Date());
  const spentOn = item?.date ?? today?.date ?? localNow(new Date(), "Asia/Seoul").date;
  const city = item?.day.city ?? today?.city ?? days[0]?.city ?? "porto";

  return (
    <>
      <PageHeader title="지출 추가" back={{ href: "/expenses", label: "경비" }} />
      <ExpenseForm
        action={createExpense}
        users={users}
        itineraryTitle={item?.title}
        initial={{
          spentOn,
          city,
          category: item ? CATEGORY_OF_KIND[item.kind] : "food",
          currency: "EUR",
          amount: "",
          method: "card",
          paidById: userId,
          itineraryItemId: item?.id ?? null,
          memo: "",
        }}
      />
    </>
  );
}
