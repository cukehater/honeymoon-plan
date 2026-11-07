import { describe, expect, it } from "vitest";
import { ExpenseInput, parseAmount, resolveAmountKrw } from "./expense";

const base = {
  spentOn: "2026-12-05",
  city: "barcelona",
  category: "food",
  currency: "EUR",
  amount: "12.5",
  method: "card",
  paidById: "1",
  budgetItemId: "",
  itineraryItemId: "",
  memo: "",
};

describe("parseAmount", () => {
  it("converts euros to cents without floats", () => {
    expect(parseAmount("12.5", "EUR")).toBe(1250);
    expect(parseAmount("0.07", "EUR")).toBe(7);
    expect(parseAmount("1,234.56", "EUR")).toBe(123456);
    expect(parseAmount("60", "EUR")).toBe(6000);
    expect(parseAmount("1.234", "EUR")).toBeNull();
    expect(parseAmount("abc", "EUR")).toBeNull();
  });
  it("accepts whole won only", () => {
    expect(parseAmount("50,000", "KRW")).toBe(50000);
    expect(parseAmount("10.5", "KRW")).toBeNull();
  });
});

describe("ExpenseInput", () => {
  it("parses a form into stored values", () => {
    const r = ExpenseInput.parse(base);
    expect(r).toMatchObject({ amountMinor: 1250, paidById: 1, budgetItemId: null, itineraryItemId: null, memo: null });
    expect(r).not.toHaveProperty("amount");
  });
  it("rejects zero, negative and unknown enum values", () => {
    expect(ExpenseInput.safeParse({ ...base, amount: "0" }).success).toBe(false);
    expect(ExpenseInput.safeParse({ ...base, amount: "-3" }).success).toBe(false);
    expect(ExpenseInput.safeParse({ ...base, category: "gift" }).success).toBe(false);
    expect(ExpenseInput.safeParse({ ...base, currency: "USD" }).success).toBe(false);
  });
});

describe("resolveAmountKrw", () => {
  const prev = { currency: "EUR" as const, amountMinor: 10000, amountKrw: 160000, fxRate: 1500 };
  it("keeps a previous manual edit when amount is unchanged", () => {
    expect(resolveAmountKrw(prev, { currency: "EUR", amountMinor: 10000, amountKrw: 160000 }, 1544)).toEqual({ fxRate: 1500, amountKrw: 160000 });
  });
  it("uses a newly typed won amount", () => {
    expect(resolveAmountKrw(prev, { currency: "EUR", amountMinor: 10000, amountKrw: 158000 }, 1544)).toEqual({ fxRate: 1500, amountKrw: 158000 });
  });
  it("recalculates with the stored rate when the euro amount changes", () => {
    expect(resolveAmountKrw(prev, { currency: "EUR", amountMinor: 12000, amountKrw: 160000 }, 1544)).toEqual({ fxRate: 1500, amountKrw: 180000 });
  });
  it("switches currency", () => {
    expect(resolveAmountKrw(prev, { currency: "KRW", amountMinor: 50000, amountKrw: 160000 }, 1544)).toEqual({ fxRate: 1, amountKrw: 50000 });
    const krw = { currency: "KRW" as const, amountMinor: 50000, amountKrw: 50000, fxRate: 1 };
    expect(resolveAmountKrw(krw, { currency: "EUR", amountMinor: 3000, amountKrw: 50000 }, 1544)).toEqual({ fxRate: 1544, amountKrw: 46320 });
  });
});
