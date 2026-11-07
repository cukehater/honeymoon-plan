import Link from "next/link";
import { SummaryTiles } from "@/components/summary-tiles";
import { CATEGORIES, CATEGORY_LABEL, summarizeBudget } from "@/lib/budget";
import { db } from "@/lib/db";
import { centsToInput, formatDate, formatEur, formatKrw } from "@/lib/format";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { BudgetItemForm, SettingForm } from "./settings-forms";

export const metadata = { title: "경비" };

export default async function ExpensesPage() {
  await getSession();
  const [budgetItems, expenses, settings] = await Promise.all([
    db.budgetItem.findMany({ orderBy: { sortOrder: "asc" } }),
    db.expense.findMany({ orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }], include: { paidBy: { select: { name: true } } } }),
    getSettings(),
  ]);
  const s = summarizeBudget({ budgetItems, expenses, ...settings });
  const dates = Object.keys(s.byDate).sort().reverse();

  return (
    <>
      <h1 className="text-[28px]">경비</h1>
      <SummaryTiles s={s} />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">항목별 예산 대비 실제</h2>
        <ul className="flex flex-col gap-3">
          {CATEGORIES.map((c) => {
            const t = s.byCategory[c];
            if (t.budget === 0 && t.actual === 0) return null;
            const over = t.actual > t.budget;
            const pct = t.budget ? Math.min(100, (t.actual / t.budget) * 100) : 100;
            return (
              <li key={c} className="flex flex-col gap-1">
                <div className="flex flex-wrap justify-between gap-x-3 text-sm">
                  <span className="font-semibold">{CATEGORY_LABEL[c]}</span>
                  <span className="mono text-muted">
                    <span className={over ? "font-semibold text-warn" : "text-fg"}>{formatKrw(t.actual)}</span> / {formatKrw(t.budget)}
                    {over && <span className="sr-only"> 예산 초과</span>}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                  <i className={`block h-full ${over ? "bg-warn" : "bg-ok"}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted">실제는 기록한 지출만 셉니다. 결제 완료로 잡은 예산은 위 &lsquo;결제 완료&rsquo; 합계에 들어 있어요.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">날짜별 지출</h2>
        {dates.length === 0 && <p className="text-sm text-muted">아직 기록한 지출이 없습니다.</p>}
        {dates.map((d) => (
          <div key={d} className="flex flex-col rounded-[10px] border border-line bg-surface">
            <div className="flex justify-between border-b border-line px-4 py-2.5 text-sm">
              <span className="mono">{formatDate(d)}</span>
              <span className="mono font-semibold">{formatKrw(s.byDate[d])}</span>
            </div>
            <ul>
              {expenses
                .filter((e) => e.spentOn === d)
                .map((e) => (
                  <li key={e.id} className="border-t border-line first:border-t-0">
                    <Link href={`/expenses/${e.id}`} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2.5 text-fg no-underline">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold">{e.title}</span>
                        <span className="truncate text-xs text-muted">
                          {CATEGORY_LABEL[e.category]} · {e.method === "card" ? "카드" : "현금"} · {e.paidBy.name}
                          {e.memo && ` · ${e.memo}`}
                        </span>
                      </span>
                      <span className="mono flex shrink-0 flex-col items-end text-sm">
                        <span>{formatKrw(e.amountKrw)}</span>
                        {e.currency === "EUR" && <span className="text-xs text-muted">{formatEur(e.amountMinor)}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">환율·예비비</h2>
        <SettingForm name="fx_eur_krw" label="€1당 원화" unit="원" initial={settings.fxRate} />
        <SettingForm name="reserve_pct" label="예비비 비율" unit="%" initial={settings.reservePct} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">예산 항목</h2>
        <ul className="flex flex-col rounded-[10px] border border-line bg-surface">
          {budgetItems.map((b) => (
            <li key={b.id} className="border-t border-line px-4 first:border-t-0">
              <details>
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-2 text-sm">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{b.title}</span>
                    <span className="text-xs text-muted">
                      {CATEGORY_LABEL[b.category]} ·{" "}
                      <span className={b.status === "paid" ? "text-ok" : "text-ocre"}>{b.status === "paid" ? "결제 완료" : "예상"}</span>
                    </span>
                  </span>
                  <span className="mono shrink-0">{b.currency === "EUR" ? formatEur(b.amountMinor) : formatKrw(b.amountMinor)}</span>
                </summary>
                <BudgetItemForm
                  initial={{
                    id: b.id,
                    category: b.category,
                    title: b.title,
                    status: b.status,
                    currency: b.currency,
                    amount: b.currency === "EUR" ? centsToInput(b.amountMinor) : String(b.amountMinor),
                    note: b.note ?? "",
                  }}
                />
                <div className="h-3" />
              </details>
            </li>
          ))}
        </ul>
        <details className="rounded-[10px] border border-dashed border-line px-4">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">+ 예산 항목 추가</summary>
          <BudgetItemForm initial={{ category: "etc", title: "", status: "estimated", currency: "EUR", amount: "", note: "" }} />
          <div className="h-3" />
        </details>
      </section>
    </>
  );
}
