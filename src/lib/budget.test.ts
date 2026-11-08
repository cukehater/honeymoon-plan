import { describe, expect, it } from "vitest";
import { summarizeExpenses, type ExpenseRow } from "./budget";

const row = (o: Partial<ExpenseRow>): ExpenseRow => ({ spentOn: "2026-12-05", category: "food", amountKrw: 0, ...o });

describe("summarizeExpenses", () => {
  it("is all zeros with no expenses", () => {
    const s = summarizeExpenses([]);
    expect(s).toMatchObject({ total: 0, perPerson: 0, count: 0, byDate: {} });
    expect(Object.values(s.byCategory).every((v) => v === 0)).toBe(true);
  });

  it("sums stored won amounts by category and date", () => {
    const s = summarizeExpenses([
      row({ amountKrw: 19_300 }), // €12.50 × 1,544
      row({ amountKrw: 160_000, category: "shopping", spentOn: "2026-12-07" }), // 카드 청구액으로 고친 원화
      row({ amountKrw: 50_000, category: "transport" }), // 원화 지출
    ]);
    expect(s.total).toBe(229_300);
    expect(s.count).toBe(3);
    expect(s.byCategory).toMatchObject({ food: 19_300, shopping: 160_000, transport: 50_000, air: 0 });
    expect(s.byDate).toEqual({ "2026-12-05": 69_300, "2026-12-07": 160_000 });
  });

  it("rounds the per-person share", () => {
    expect(summarizeExpenses([row({ amountKrw: 1_001 })]).perPerson).toBe(501);
  });
});
