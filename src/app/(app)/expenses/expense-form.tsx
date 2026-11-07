"use client";

import { useState, useTransition } from "react";
import type { Category, City } from "@/generated/prisma/enums";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/budget";
import { useSafeAction } from "@/lib/use-safe-action";
import { deleteExpense, type FormState } from "./actions";

export type ExpenseFormValues = {
  spentOn: string;
  city: City;
  category: Category;
  currency: "EUR" | "KRW";
  amount: string;
  method: "card" | "cash";
  paidById: number;
  budgetItemId: number | null;
  itineraryItemId: number | null;
  memo: string;
  taxFree: string; // 환급 예상액(유로)
  taxFreeStatus: "" | "form" | "validated" | "refunded";
  amountKrw?: string; // 수정 화면에서만
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial: ExpenseFormValues;
  users: { id: number; name: string }[];
  budgetItems: { id: number; title: string; category: Category }[];
  itineraryTitle?: string;
  expenseId?: number;
};

const CITY_LABEL: Record<City, string> = { porto: "포르투", barcelona: "바르셀로나", paris: "파리" };

const chip =
  "flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface px-4 text-sm has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-azul";

function Chips<T extends string | number>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className={chip}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ExpenseForm({ action, initial, users, budgetItems, itineraryTitle, expenseId }: Props) {
  // 제어 컴포넌트로 두어 저장이 실패해도 입력값이 남는다
  const [v, setV] = useState(initial);
  const set = <K extends keyof ExpenseFormValues>(k: K, value: ExpenseFormValues[K]) => setV((s) => ({ ...s, [k]: value }));
  const [state, formAction, pending] = useSafeAction(action);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState("");
  const linkable = budgetItems.filter((b) => b.category === v.category);
  const input = "min-h-11 rounded-lg border border-line bg-surface px-3 text-base";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {itineraryTitle && (
        <p className="text-sm text-muted">
          일정 연결: <b className="text-fg">{itineraryTitle}</b>
        </p>
      )}
      <input type="hidden" name="itineraryItemId" value={v.itineraryItemId ?? ""} />

      <div className="flex items-end gap-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-muted">
          금액
          <input
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            required
            autoFocus={!expenseId}
            value={v.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0"
            className="mono w-full min-w-0 border-b-2 border-line bg-transparent py-1 text-[40px] text-fg focus:border-azul focus:outline-none"
          />
        </label>
        <fieldset className="flex shrink-0 overflow-hidden rounded-full border border-line">
          <legend className="sr-only">통화</legend>
          {(["EUR", "KRW"] as const).map((c) => (
            <label
              key={c}
              className="flex min-h-11 min-w-14 cursor-pointer items-center justify-center px-3 text-sm has-[:checked]:bg-fg has-[:checked]:text-bg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-azul"
            >
              <input type="radio" name="currency" value={c} checked={v.currency === c} onChange={() => set("currency", c)} className="sr-only" />
              {c === "EUR" ? "€ EUR" : "₩ KRW"}
            </label>
          ))}
        </fieldset>
      </div>

      {v.amountKrw !== undefined && (
        <label className="flex flex-col gap-1 text-sm text-muted">
          원화 금액 (카드 청구액으로 고칠 수 있음)
          <input
            name="amountKrw"
            inputMode="numeric"
            value={v.amountKrw}
            onChange={(e) => set("amountKrw", e.target.value)}
            className={`mono ${input} text-fg`}
          />
        </label>
      )}

      <Chips
        name="category"
        legend="항목"
        value={v.category}
        options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))}
        onChange={(c) => setV((s) => ({ ...s, category: c, budgetItemId: null }))}
      />

      {linkable.length > 0 && (
        <label className="flex flex-col gap-1 text-sm text-muted">
          예산 항목 연결 (선택)
          <select
            name="budgetItemId"
            value={v.budgetItemId ?? ""}
            onChange={(e) => set("budgetItemId", e.target.value ? Number(e.target.value) : null)}
            className={`${input} text-fg`}
          >
            <option value="">연결 안 함</option>
            {linkable.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <Chips
        name="method"
        legend="결제수단"
        value={v.method}
        options={[
          { value: "card", label: "카드" },
          { value: "cash", label: "현금" },
        ]}
        onChange={(m) => set("method", m)}
      />
      <Chips
        name="paidById"
        legend="결제한 사람"
        value={v.paidById}
        options={users.map((u) => ({ value: u.id, label: u.name }))}
        onChange={(id) => set("paidById", id)}
      />

      <label className="flex flex-col gap-1 text-sm text-muted">
        메모
        <input name="memo" value={v.memo} onChange={(e) => set("memo", e.target.value)} maxLength={500} className={`${input} text-fg`} />
      </label>

      <details open={!!(v.taxFree || v.taxFreeStatus)} className="rounded-lg border border-line px-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm text-muted">택스리펀드 (선택)</summary>
        <div className="grid grid-cols-2 gap-3 pb-3">
          <label className="flex flex-col gap-1 text-sm text-muted">
            환급 예상액 (€)
            <input
              name="taxFree"
              inputMode="decimal"
              value={v.taxFree}
              onChange={(e) => set("taxFree", e.target.value)}
              className={`mono ${input} text-fg`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            상태
            <select
              name="taxFreeStatus"
              value={v.taxFreeStatus}
              onChange={(e) => set("taxFreeStatus", e.target.value as ExpenseFormValues["taxFreeStatus"])}
              className={`${input} text-fg`}
            >
              <option value="">없음</option>
              <option value="form">서류 받음</option>
              <option value="validated">공항 확인</option>
              <option value="refunded">환급 완료</option>
            </select>
          </label>
        </div>
      </details>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          날짜
          <input type="date" name="spentOn" required value={v.spentOn} onChange={(e) => set("spentOn", e.target.value)} className={`${input} text-fg`} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          도시
          <select name="city" value={v.city} onChange={(e) => set("city", e.target.value as City)} className={`${input} text-fg`}>
            {(Object.keys(CITY_LABEL) as City[]).map((c) => (
              <option key={c} value={c}>
                {CITY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-warn">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending || deleting} className="min-h-12 rounded-lg bg-fg text-base font-bold text-bg disabled:opacity-60">
        {pending ? "저장 중…" : "저장"}
      </button>

      {expenseId && (
        <>
          <button
            type="button"
            disabled={pending || deleting}
            onClick={() => {
              if (!confirm("이 지출을 삭제할까요?")) return;
              setDeleteError("");
              startDelete(async () => {
                try {
                  const r = await deleteExpense(expenseId);
                  if (r?.error) setDeleteError(r.error);
                } catch {
                  setDeleteError("서버에 연결하지 못했습니다. 다시 시도해 주세요.");
                }
              });
            }}
            className="min-h-11 rounded-lg border border-warn text-sm font-semibold text-warn disabled:opacity-60"
          >
            {deleting ? "삭제 중…" : "삭제"}
          </button>
          {deleteError && (
            <p role="alert" className="text-sm text-warn">
              {deleteError}
            </p>
          )}
        </>
      )}
    </form>
  );
}
