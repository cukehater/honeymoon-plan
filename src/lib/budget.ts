// 경비 집계. 화면에서 따로 계산하지 않고 이 함수만 쓴다. 금액은 모두 정수(원, 유로는 센트).
import type { BudgetStatus, Category, Currency, TaxFreeStatus } from "../generated/prisma/enums";

export type BudgetItemRow = {
  id: number;
  category: Category;
  status: BudgetStatus;
  currency: Currency;
  amountMinor: number;
};

export type ExpenseRow = {
  spentOn: string;
  category: Category;
  currency: Currency;
  amountMinor: number;
  amountKrw: number;
  budgetItemId: number | null;
};

export type CategoryTotal = { budget: number; actual: number; expected: number };

export type BudgetSummary = {
  paid: number; // 결제 완료: 결제 완료 예산 항목 + 실제 지출
  estimated: number; // 추가 예상(예비비 제외): 예상 항목의 남은 금액
  reserve: number;
  total: number;
  perPerson: number;
  byCategory: Record<Category, CategoryTotal>;
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

export function summarizeBudget(input: {
  budgetItems: BudgetItemRow[];
  expenses: ExpenseRow[];
  fxRate: number;
  reservePct: number;
}): BudgetSummary {
  const { budgetItems, expenses, fxRate, reservePct } = input;
  const byCategory = Object.fromEntries(
    CATEGORIES.map((c) => [c, { budget: 0, actual: 0, expected: 0 }]),
  ) as Record<Category, CategoryTotal>;
  const byDate: Record<string, number> = {};

  const linked = new Map<number, ExpenseRow[]>();
  let paid = 0;
  for (const e of expenses) {
    byCategory[e.category].actual += e.amountKrw;
    byDate[e.spentOn] = (byDate[e.spentOn] ?? 0) + e.amountKrw;
    if (e.budgetItemId != null && budgetItems.some((b) => b.id === e.budgetItemId)) {
      linked.set(e.budgetItemId, [...(linked.get(e.budgetItemId) ?? []), e]);
    } else {
      // 연결 없는 지출은 그대로 더한다
      byCategory[e.category].expected += e.amountKrw;
      paid += e.amountKrw;
    }
  }

  let estimated = 0;
  let localRemainingCents = 0;
  for (const b of budgetItems) {
    const budgetKrw = b.currency === "KRW" ? b.amountMinor : eurToKrw(b.amountMinor, fxRate);
    const spent = linked.get(b.id) ?? [];
    const spentKrw = spent.reduce((s, e) => s + e.amountKrw, 0);
    const expected = Math.max(budgetKrw, spentKrw);
    byCategory[b.category].budget += budgetKrw;
    byCategory[b.category].expected += expected;

    if (b.status === "paid") {
      paid += expected;
    } else {
      paid += spentKrw;
      estimated += expected - spentKrw;
    }

    // 예비비 기준: 유로로 잡은 현지 예상(항공 제외)의 남은 금액
    if (b.status === "estimated" && b.currency === "EUR" && b.category !== "air") {
      const spentCents = spent.reduce(
        (s, e) => s + (e.currency === "EUR" ? e.amountMinor : Math.round((e.amountKrw * 100) / fxRate)),
        0,
      );
      localRemainingCents += b.amountMinor - spentCents;
    }
  }

  const reserve = Math.round((Math.max(0, localRemainingCents) * reservePct * fxRate) / 10000);
  const total = paid + estimated + reserve;
  return { paid, estimated, reserve, total, perPerson: Math.round(total / 2), byCategory, byDate };
}

// 지출 원화 합계(하루 합계 등)
export const sumKrw = (expenses: { amountKrw: number }[]) => expenses.reduce((s, e) => s + e.amountKrw, 0);

export const DUTY_FREE_LIMIT_USD = 800;

export type TaxFreeRow = {
  category: Category;
  amountKrw: number;
  paidById: number;
  taxFreeMinor: number | null;
  taxFreeStatus: TaxFreeStatus | null;
};

// 택스리펀드 합계(유로 센트)와 결제한 사람별 쇼핑 합계 대 1인 면세 한도(미화 800달러). usdRate가 없으면 한도는 null.
export function summarizeTaxFree(expenses: TaxFreeRow[], usdRate: number | null) {
  const refund = { expected: 0, refunded: 0, byStatus: { form: 0, validated: 0, refunded: 0 } as Record<TaxFreeStatus, number> };
  const shoppingByUser: Record<number, number> = {};
  for (const e of expenses) {
    if (e.taxFreeMinor) {
      refund.expected += e.taxFreeMinor;
      if (e.taxFreeStatus) refund.byStatus[e.taxFreeStatus] += e.taxFreeMinor;
      if (e.taxFreeStatus === "refunded") refund.refunded += e.taxFreeMinor;
    }
    if (e.category === "shopping") shoppingByUser[e.paidById] = (shoppingByUser[e.paidById] ?? 0) + e.amountKrw;
  }
  const limitKrw = usdRate ? Math.round(DUTY_FREE_LIMIT_USD * usdRate) : null;
  return { refund, shoppingByUser, limitKrw };
}
