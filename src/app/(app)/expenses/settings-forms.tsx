"use client";

import { useState } from "react";
import type { BudgetStatus, Category, Currency } from "@/generated/prisma/enums";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/budget";
import { field, input, primaryButton } from "@/components/form-styles";
import { useSafeAction } from "@/lib/use-safe-action";
import { type FormState, updateSetting, upsertBudgetItem } from "./actions";

const submit = `${primaryButton} min-h-12 text-[15px]`;

function Result({ state }: { state: FormState }) {
  if (!state) return null;
  return state.error ? (
    <p role="alert" className="text-[13px] font-semibold text-warn">
      {state.error}
    </p>
  ) : (
    <p role="status" className="text-[13px] font-semibold text-ok">
      저장했습니다.
    </p>
  );
}

export function SettingForm({ name, label, unit, initial }: { name: "fx_eur_krw" | "reserve_pct" | "fx_usd_krw"; label: string; unit: string; initial: number | null }) {
  const [value, setValue] = useState(initial == null ? "" : String(initial));
  const [state, action, pending] = useSafeAction(updateSetting);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="key" value={name} />
      <label className={`${field} min-w-0 flex-1`}>
        {label}
        <span className="relative flex items-center">
          <input name="value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className={`mono pr-10 text-right ${input}`} />
          <span className="pointer-events-none absolute right-4 text-[15px] font-semibold text-muted">{unit}</span>
        </span>
      </label>
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "저장 중…" : "저장"}
      </button>
      <div className="basis-full">
        <Result state={state} />
      </div>
    </form>
  );
}

export type BudgetItemValues = {
  id?: number;
  category: Category;
  title: string;
  status: BudgetStatus;
  currency: Currency;
  amount: string;
  note: string;
};

export function BudgetItemForm({ initial }: { initial: BudgetItemValues }) {
  const [v, setV] = useState(initial);
  const set = <K extends keyof BudgetItemValues>(k: K, value: BudgetItemValues[K]) => setV((s) => ({ ...s, [k]: value }));
  const [state, action, pending] = useSafeAction(upsertBudgetItem);
  return (
    <form action={action} className="flex flex-col gap-3 pt-2">
      <input type="hidden" name="id" value={v.id ?? ""} />
      <label className={field}>
        이름
        <input name="title" required value={v.title} onChange={(e) => set("title", e.target.value)} className={input} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={field}>
          항목
          <select name="category" value={v.category} onChange={(e) => set("category", e.target.value as Category)} className={input}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          상태
          <select name="status" value={v.status} onChange={(e) => set("status", e.target.value as BudgetStatus)} className={input}>
            <option value="paid">결제 완료</option>
            <option value="estimated">예상</option>
          </select>
        </label>
        <label className={field}>
          금액
          <input name="amount" inputMode="decimal" required value={v.amount} onChange={(e) => set("amount", e.target.value)} className={`mono text-right ${input}`} />
        </label>
        <label className={field}>
          통화
          <select name="currency" value={v.currency} onChange={(e) => set("currency", e.target.value as Currency)} className={input}>
            <option value="EUR">EUR</option>
            <option value="KRW">KRW</option>
          </select>
        </label>
      </div>
      <label className={field}>
        메모
        <input name="note" value={v.note} onChange={(e) => set("note", e.target.value)} className={input} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={submit}>
          {pending ? "저장 중…" : v.id ? "저장" : "추가"}
        </button>
        <Result state={state} />
      </div>
    </form>
  );
}
