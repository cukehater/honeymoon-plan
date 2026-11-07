import { z } from "zod";
import { CATEGORIES, eurToKrw } from "../budget";

const optionalId = z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().int().positive().nullable());

// "12.5" → 1250 (부동소수점 없이 문자열로 변환). 유로는 소수 둘째 자리까지.
export function parseAmount(raw: string, currency: "EUR" | "KRW"): number | null {
  const s = raw.replace(/[,\s]/g, "");
  if (currency === "KRW") return /^\d+$/.test(s) ? Number(s) : null;
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  return m ? Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0")) : null;
}

export const ExpenseInput = z
  .object({
    spentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜를 고르세요."),
    city: z.enum(["paris", "porto", "barcelona"]),
    category: z.enum(CATEGORIES),
    currency: z.enum(["EUR", "KRW"]),
    amount: z.string(),
    method: z.enum(["card", "cash"]),
    paidById: z.coerce.number().int().positive(),
    budgetItemId: optionalId,
    itineraryItemId: optionalId,
    memo: z.string().trim().max(500).transform((s) => s || null),
  })
  .transform(({ amount, ...rest }, ctx) => {
    const amountMinor = parseAmount(amount, rest.currency);
    if (amountMinor == null || amountMinor <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: rest.currency === "EUR" ? "금액은 0보다 크고 소수 둘째 자리까지 입력하세요." : "금액은 0보다 큰 정수로 입력하세요.",
      });
      return z.NEVER;
    }
    return { ...rest, amountMinor };
  });

export type ExpenseInputData = z.output<typeof ExpenseInput>;

// 수정 시 환율·원화 금액 결정. 사용자가 원화 금액을 직접 고쳤으면 그 값을 쓰고, 금액·통화가 바뀌었으면
// 기록 당시 환율(KRW→EUR로 바뀌면 현재 환율)로 다시 계산하고, 둘 다 아니면 기존 값을 유지한다.
export function resolveAmountKrw(
  prev: { currency: "EUR" | "KRW"; amountMinor: number; amountKrw: number; fxRate: number },
  next: { currency: "EUR" | "KRW"; amountMinor: number; amountKrw: number | null },
  currentFx: number,
): { fxRate: number; amountKrw: number } {
  const fxRate = next.currency === "KRW" ? 1 : prev.currency === "EUR" ? prev.fxRate : currentFx;
  if (next.amountKrw != null && next.amountKrw !== prev.amountKrw) return { fxRate, amountKrw: next.amountKrw };
  if (next.currency === prev.currency && next.amountMinor === prev.amountMinor) return { fxRate, amountKrw: prev.amountKrw };
  return { fxRate, amountKrw: next.currency === "KRW" ? next.amountMinor : eurToKrw(next.amountMinor, fxRate) };
}
