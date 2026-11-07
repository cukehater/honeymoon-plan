import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { centsToInput } from "@/lib/format";
import { getSession } from "@/lib/session";
import { updateExpense } from "../actions";
import { ExpenseForm } from "../expense-form";

export const metadata = { title: "지출 수정" };

export default async function EditExpensePage({ params }: PageProps<"/expenses/[id]">) {
  await getSession();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [expense, users, budgetItems] = await Promise.all([
    db.expense.findUnique({ where: { id }, include: { itineraryItem: true } }),
    db.user.findMany({ orderBy: { id: "asc" } }),
    db.budgetItem.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true, category: true } }),
  ]);
  if (!expense) notFound();

  return (
    <>
      <h1 className="text-[28px]">지출 수정</h1>
      <ExpenseForm
        action={updateExpense.bind(null, expense.id)}
        users={users}
        budgetItems={budgetItems}
        itineraryTitle={expense.itineraryItem?.title}
        expenseId={expense.id}
        initial={{
          spentOn: expense.spentOn,
          city: expense.city,
          category: expense.category,
          currency: expense.currency,
          amount: expense.currency === "EUR" ? centsToInput(expense.amountMinor) : String(expense.amountMinor),
          method: expense.method,
          paidById: expense.paidById,
          budgetItemId: expense.budgetItemId,
          itineraryItemId: expense.itineraryItemId,
          memo: expense.memo ?? "",
          amountKrw: String(expense.amountKrw),
        }}
      />
    </>
  );
}
