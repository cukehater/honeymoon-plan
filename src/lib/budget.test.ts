import { describe, expect, it } from "vitest";
import seed from "../../docs/seed-data.json";
import { summarizeBudget, summarizeTaxFree, type BudgetItemRow, type ExpenseRow, type TaxFreeRow } from "./budget";

// 시드 순서대로 넣으면 id가 1부터 붙는다(6: 예트먼 €550, 7: 파에야 €90, 21: 쇼핑 €300)
const budgetItems = seed.budgetItems.map((b, i) => ({ ...b, id: i + 1 })) as BudgetItemRow[];
const run = (expenses: ExpenseRow[]) => summarizeBudget({ budgetItems, expenses, fxRate: 1544, reservePct: 10 });
const eur = (cents: number, extra: Partial<ExpenseRow> = {}): ExpenseRow => ({
  spentOn: "2026-12-03",
  category: "food",
  currency: "EUR",
  amountMinor: cents,
  amountKrw: Math.round((cents * 1544) / 100),
  budgetItemId: null,
  ...extra,
});

describe("summarizeBudget", () => {
  it("matches the reference page with seed data and no expenses", () => {
    const s = run([]);
    expect(s.paid).toBe(4_238_191);
    expect(s.estimated).toBe(4_507_904);
    expect(s.reserve).toBe(380_750);
    expect(s.total).toBe(9_126_845);
    expect(s.perPerson).toBe(4_563_423);
    expect(s.byCategory.air).toEqual({ budget: 2_685_370 + 540_400, actual: 0, expected: 2_685_370 + 540_400 });
    expect(s.byDate).toEqual({});
  });

  it("spending under budget moves money from estimated to paid and shrinks the reserve", () => {
    const s = run([eur(50_000, { budgetItemId: 6 })]); // 예트먼 €550 중 €500
    expect(s.paid).toBe(4_238_191 + 772_000);
    expect(s.estimated).toBe(4_507_904 - 772_000);
    expect(s.reserve).toBe(303_550); // (€2,466 − €500) × 10% × 1,544
    expect(s.total).toBe(9_049_645);
    expect(s.byCategory.food.actual).toBe(772_000);
    expect(s.byCategory.food.expected).toBe(1_930_000); // 예산 그대로
  });

  it("spending over budget uses the actual amount", () => {
    const s = run([eur(12_000, { budgetItemId: 7 })]); // 파에야 €90 예산에 €120
    expect(s.paid).toBe(4_238_191 + 185_280);
    expect(s.estimated).toBe(4_507_904 - 138_960);
    expect(s.reserve).toBe(362_222); // 남은 금액 €2,466 − €120
    expect(s.total).toBe(9_154_637);
    expect(s.byCategory.food.expected).toBe(1_930_000 + 185_280 - 138_960);
  });

  it("adds unlinked expenses as they are", () => {
    const s = run([eur(2_000)]);
    expect(s.paid).toBe(4_238_191 + 30_880);
    expect(s.estimated).toBe(4_507_904);
    expect(s.reserve).toBe(380_750);
    expect(s.total).toBe(9_126_845 + 30_880);
    expect(s.byDate).toEqual({ "2026-12-03": 30_880 });
  });

  it("handles KRW expenses", () => {
    const s = run([{ spentOn: "2026-12-05", category: "etc", currency: "KRW", amountMinor: 50_000, amountKrw: 50_000, budgetItemId: null }]);
    expect(s.total).toBe(9_126_845 + 50_000);
    expect(s.byCategory.etc.actual).toBe(50_000);
  });

  it("uses an edited amountKrw instead of recalculating", () => {
    // €100을 1,500원 환율로 기록했다가 카드 청구액 160,000원으로 고친 쇼핑 지출
    const s = run([{ spentOn: "2026-12-07", category: "shopping", currency: "EUR", amountMinor: 10_000, amountKrw: 160_000, budgetItemId: 21 }]);
    expect(s.byCategory.shopping.actual).toBe(160_000);
    expect(s.paid).toBe(4_238_191 + 160_000);
    expect(s.estimated).toBe(4_507_904 - 160_000);
    expect(s.reserve).toBe(365_310); // 남은 금액은 유로 기준 €2,466 − €100
    expect(s.byDate).toEqual({ "2026-12-07": 160_000 });
  });

  it("never lets the reserve go negative", () => {
    const s = run([eur(400_000, { budgetItemId: 8 })]); // 남은 금액 합이 음수
    expect(s.reserve).toBe(0);
  });
});

describe("summarizeTaxFree", () => {
  const row = (o: Partial<TaxFreeRow>): TaxFreeRow => ({ category: "shopping", amountKrw: 0, paidById: 1, taxFreeMinor: null, taxFreeStatus: null, ...o });
  it("sums refunds by status and shopping by payer", () => {
    const s = summarizeTaxFree(
      [
        row({ amountKrw: 600_000, taxFreeMinor: 4_500, taxFreeStatus: "form" }),
        row({ amountKrw: 700_000, taxFreeMinor: 5_000, taxFreeStatus: "refunded" }),
        row({ amountKrw: 300_000, paidById: 2 }),
        row({ category: "food", amountKrw: 90_000 }),
      ],
      1400,
    );
    expect(s.refund).toEqual({ expected: 9_500, refunded: 5_000, byStatus: { form: 4_500, validated: 0, refunded: 5_000 } });
    expect(s.shoppingByUser).toEqual({ 1: 1_300_000, 2: 300_000 });
    expect(s.limitKrw).toBe(1_120_000);
  });
  it("has no limit without a dollar rate", () => {
    expect(summarizeTaxFree([], null).limitKrw).toBeNull();
  });
});
