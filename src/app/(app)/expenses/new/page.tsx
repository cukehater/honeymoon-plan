import type { Category, ItemKind } from "@/generated/prisma/enums";
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
  const [users, budgetItems, days, item] = await Promise.all([
    db.user.findMany({ orderBy: { id: "asc" } }),
    db.budgetItem.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true, category: true } }),
    db.tripDay.findMany({ orderBy: { date: "asc" } }),
    Number.isInteger(linkedId) && linkedId > 0
      ? db.itineraryItem.findUnique({ where: { id: linkedId }, include: { day: true } })
      : null,
  ]);
  // 날짜·도시: 연결한 일정 → 오늘 여행일 → (여행 전후) 한국 날짜와 첫날 도시
  const today = currentTripDay(days, new Date());
  const spentOn = item?.date ?? today?.date ?? localNow(new Date(), "Asia/Seoul").date;
  const city = item?.day.city ?? today?.city ?? days[0]?.city ?? "porto";

  return (
    <>
      <h1 className="text-[28px]">지출 추가</h1>
      <ExpenseForm
        action={createExpense}
        users={users}
        budgetItems={budgetItems}
        itineraryTitle={item?.title}
        initial={{
          spentOn,
          city,
          category: item ? CATEGORY_OF_KIND[item.kind] : "food",
          currency: "EUR",
          amount: "",
          method: "card",
          paidById: userId,
          budgetItemId: null,
          itineraryItemId: item?.id ?? null,
          memo: "",
        }}
      />
    </>
  );
}
