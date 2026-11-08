// 경비 집계. 화면에서 따로 계산하지 않고 이 함수만 쓴다. 금액은 모두 정수(원, 유로는 센트).
import type { Category } from "../generated/prisma/enums";

export type ExpenseRow = {
  spentOn: string;
  category: Category;
  amountKrw: number;
};

export type ExpenseSummary = {
  total: number;
  perPerson: number;
  count: number;
  byCategory: Record<Category, number>;
  byDate: Record<string, number>;
};

export const CATEGORIES = ["air", "stay", "food", "tour", "transport", "shopping", "etc"] as const satisfies Category[];

export const CATEGORY_LABEL: Record<Category, string> = {
  air: "항공",
  stay: "숙소",
  food: "식비",
  tour: "관광·투어",
  transport: "교통",
  shopping: "쇼핑",
  etc: "기타",
};

// 유로 센트 × 환율 → 원
export const eurToKrw = (cents: number, fxRate: number) => Math.round((cents * fxRate) / 100);

// 지출 원화 합계(하루 합계 등)
export const sumKrw = (expenses: { amountKrw: number }[]) => expenses.reduce((s, e) => s + e.amountKrw, 0);

// 실제 지출 집계. 원화는 저장된 amountKrw(기록 당시 환율 또는 카드 청구액으로 고친 값)를 그대로 더한다.
export function summarizeExpenses(expenses: ExpenseRow[]): ExpenseSummary {
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  const byDate: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] += e.amountKrw;
    byDate[e.spentOn] = (byDate[e.spentOn] ?? 0) + e.amountKrw;
  }
  const total = sumKrw(expenses);
  return { total, perPerson: Math.round(total / 2), count: expenses.length, byCategory, byDate };
}
