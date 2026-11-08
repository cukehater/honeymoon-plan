"use client";

import { useState, useTransition } from "react";
import { Link2, Trash2 } from "lucide-react";
import { field, input, primaryButton } from "@/components/form-styles";
import { CATEGORY_ICON, CITY_NAME } from "@/components/travel";
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
  itineraryItemId: number | null;
  memo: string;
  amountKrw?: string; // 수정 화면에서만
};

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial: ExpenseFormValues;
  users: { id: number; name: string }[];
  itineraryTitle?: string;
  expenseId?: number;
};

// 세그먼트 버튼(통화·결제수단·결제한 사람). 실제 라디오를 숨겨 키보드로도 고를 수 있다.
function Segmented<T extends string | number>({
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
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-[13px] font-semibold text-muted">{legend}</legend>
      <div className="flex gap-1 rounded-[var(--radius-control)] bg-surface-2 p-1">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-[11px] text-[15px] font-semibold text-muted transition-colors has-[:checked]:bg-surface has-[:checked]:text-fg has-[:checked]:shadow-[0_1px_3px_rgb(0_0_0/0.12)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ExpenseForm({ action, initial, users, itineraryTitle, expenseId }: Props) {
  // 제어 컴포넌트로 두어 저장이 실패해도 입력값이 남는다
  const [v, setV] = useState(initial);
  const set = <K extends keyof ExpenseFormValues>(k: K, value: ExpenseFormValues[K]) => setV((s) => ({ ...s, [k]: value }));
  const [state, formAction, pending] = useSafeAction(action);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="itineraryItemId" value={v.itineraryItemId ?? ""} />

      <section className="rounded-[var(--radius-card)] bg-surface p-5">
        {itineraryTitle && (
          <p className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-semibold text-accent-ink">
            <Link2 size={14} className="shrink-0" aria-hidden />
            <span className="truncate">{itineraryTitle}</span>
          </p>
        )}
        <label className={field}>
          얼마를 썼나요?
          <span className="flex items-baseline gap-2">
            <span className="mono text-[34px] font-bold text-muted" aria-hidden>
              {v.currency === "EUR" ? "€" : "₩"}
            </span>
            <input
              name="amount"
              inputMode="decimal"
              autoComplete="off"
              required
              autoFocus={!expenseId}
              value={v.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="0"
              className="mono w-full min-w-0 bg-transparent py-1 text-[40px] font-bold text-fg outline-none placeholder:text-line"
            />
          </span>
        </label>
        <div className="mt-3">
          <Segmented
            name="currency"
            legend="통화"
            value={v.currency}
            options={[
              { value: "EUR", label: "유로 €" },
              { value: "KRW", label: "원화 ₩" },
            ]}
            onChange={(c) => set("currency", c)}
          />
        </div>
        {v.amountKrw !== undefined && (
          <label className={`${field} mt-4`}>
            원화 금액 (카드 청구액으로 고칠 수 있음)
            <input name="amountKrw" inputMode="numeric" value={v.amountKrw} onChange={(e) => set("amountKrw", e.target.value)} className={`mono ${input}`} />
          </label>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-5">
        <fieldset>
          <legend className="mb-2.5 text-[13px] font-semibold text-muted">항목</legend>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => {
              const I = CATEGORY_ICON[c];
              return (
                <label
                  key={c}
                  className="press flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[16px] bg-surface-2 text-[12px] font-semibold text-muted has-[:checked]:bg-accent-soft has-[:checked]:text-accent-ink has-[:checked]:ring-2 has-[:checked]:ring-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
                >
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={v.category === c}
                    onChange={() => set("category", c)}
                    className="sr-only"
                  />
                  <I size={22} aria-hidden />
                  {CATEGORY_LABEL[c]}
                </label>
              );
            })}
          </div>
        </fieldset>

        <Segmented
          name="method"
          legend="결제수단"
          value={v.method}
          options={[
            { value: "card", label: "카드" },
            { value: "cash", label: "현금" },
          ]}
          onChange={(m) => set("method", m)}
        />
        <Segmented name="paidById" legend="결제한 사람" value={v.paidById} options={users.map((u) => ({ value: u.id, label: u.name }))} onChange={(id) => set("paidById", id)} />

        <label className={field}>
          메모
          <input name="memo" value={v.memo} onChange={(e) => set("memo", e.target.value)} maxLength={500} placeholder="무엇을 샀는지 짧게" className={input} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className={field}>
            날짜
            <input type="date" name="spentOn" required value={v.spentOn} onChange={(e) => set("spentOn", e.target.value)} className={input} />
          </label>
          <label className={field}>
            도시
            <select name="city" value={v.city} onChange={(e) => set("city", e.target.value as City)} className={input}>
              {(Object.keys(CITY_NAME) as City[]).map((c) => (
                <option key={c} value={c}>
                  {CITY_NAME[c]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

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
            className="press flex min-h-12 items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-warn-soft text-[15px] font-semibold text-warn disabled:opacity-50"
          >
            <Trash2 size={17} aria-hidden />
            {deleting ? "삭제 중…" : "이 지출 삭제"}
          </button>
          {deleteError && (
            <p role="alert" className="text-[13px] font-semibold text-warn">
              {deleteError}
            </p>
          )}
        </>
      )}

      {/* 화면 아래 고정 저장 버튼. 오류는 버튼 바로 위에 보인다. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/90 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl flex-col gap-2">
          {state?.error && (
            <p role="alert" className="text-[13px] font-semibold text-warn">
              {state.error}
            </p>
          )}
          <button type="submit" disabled={pending || deleting} className={`${primaryButton} w-full`}>
            {pending ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
