import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { expense as expenseTable } from "@/db/schema";
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
  const [expense, users] = await Promise.all([
    db.query.expense.findFirst({ where: eq(expenseTable.id, id), with: { itineraryItem: true } }),
    db.query.user.findMany({ orderBy: (u, { asc }) => asc(u.id) }),
  ]);
  if (!expense) notFound();

  return (
    <>
      <PageHeader title="지출 수정" back={{ href: "/expenses", label: "경비" }} />
      <ExpenseForm
        action={updateExpense.bind(null, expense.id)}
        users={users}
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
          itineraryItemId: expense.itineraryItemId,
          memo: expense.memo ?? "",
          amountKrw: String(expense.amountKrw),
        }}
      />
    </>
  );
}
