"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Category } from "@/generated/prisma/enums";
import { CATEGORY_LABEL, eurToKrw } from "@/lib/budget";
import { db } from "@/lib/db";
import { ExpenseInput, parseAmount, resolveAmountKrw } from "@/lib/schemas/expense";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";

export type FormState = { error?: string } | undefined;

const Id = z.coerce.number().int().positive();

function revalidateExpenses(...dates: string[]) {
  revalidatePath("/expenses");
  revalidatePath("/");
  for (const d of dates) revalidatePath(`/itinerary/${d}`);
}

// 목록에 보일 제목: 연결한 일정 → 항목 이름
async function titleFor(input: { itineraryItemId: number | null; category: Category }) {
  if (input.itineraryItemId) {
    const item = await db.itineraryItem.findUnique({ where: { id: input.itineraryItemId } });
    if (item) return item.title;
  }
  return CATEGORY_LABEL[input.category];
}

const formObject = (formData: FormData) => Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));

export async function createExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const { userId } = await getSession();
  const parsed = ExpenseInput.safeParse(formObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;
  const { fxRate } = await getSettings();
  const rate = input.currency === "EUR" ? fxRate : 1;
  try {
    await db.expense.create({
      data: {
        ...input,
        title: await titleFor(input),
        fxRate: rate,
        amountKrw: input.currency === "EUR" ? eurToKrw(input.amountMinor, rate) : input.amountMinor,
        createdById: userId,
      },
    });
  } catch {
    return { error: "저장하지 못했습니다. 다시 시도해 주세요." };
  }
  revalidateExpenses(input.spentOn);
  redirect("/expenses");
}

export async function updateExpense(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await getSession();
  const expenseId = Id.parse(id);
  const raw = formObject(formData);
  const parsed = ExpenseInput.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;
  const typedKrw = raw.amountKrw ? parseAmount(raw.amountKrw, "KRW") : null;
  if (raw.amountKrw && (typedKrw == null || typedKrw <= 0)) return { error: "원화 금액은 0보다 큰 정수로 입력하세요." };

  const prev = await db.expense.findUnique({ where: { id: expenseId } });
  if (!prev) return { error: "지출을 찾을 수 없습니다." };
  const { fxRate } = await getSettings();
  try {
    await db.expense.update({
      where: { id: expenseId },
      data: {
        ...input,
        title: await titleFor(input),
        ...resolveAmountKrw(prev, { ...input, amountKrw: typedKrw }, fxRate),
      },
    });
  } catch {
    return { error: "저장하지 못했습니다. 다시 시도해 주세요." };
  }
  revalidateExpenses(prev.spentOn, input.spentOn);
  redirect("/expenses");
}

export async function deleteExpense(id: number): Promise<FormState> {
  await getSession();
  const expenseId = Id.parse(id);
  try {
    const deleted = await db.expense.delete({ where: { id: expenseId } });
    revalidateExpenses(deleted.spentOn);
  } catch {
    return { error: "삭제하지 못했습니다. 다시 시도해 주세요." };
  }
  redirect("/expenses");
}

const SettingInput = z.object({
  key: z.literal("fx_eur_krw"),
  value: z.coerce.number().positive("환율은 0보다 커야 합니다.").max(100000),
});

export async function updateSetting(_prev: FormState, formData: FormData): Promise<FormState> {
  await getSession();
  const parsed = SettingInput.safeParse(formObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { key, value } = parsed.data;
  try {
    await db.setting.upsert({ where: { key }, create: { key, value: JSON.stringify(value) }, update: { value: JSON.stringify(value) } });
  } catch {
    return { error: "저장하지 못했습니다. 다시 시도해 주세요." };
  }
  revalidateExpenses();
  return {};
}
