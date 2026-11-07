import Link from "next/link";
import { SummaryTiles } from "@/components/summary-tiles";
import { CATEGORIES, CATEGORY_LABEL, DUTY_FREE_LIMIT_USD, summarizeBudget, summarizeTaxFree } from "@/lib/budget";
import { db } from "@/lib/db";
import { centsToInput, formatDate, formatEur, formatKrw } from "@/lib/format";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { BudgetItemForm, SettingForm } from "./settings-forms";

export const metadata = { title: "경비" };

export default async function ExpensesPage() {
  await getSession();
  const [budgetItems, expenses, settings, users] = await Promise.all([
    db.budgetItem.findMany({ orderBy: { sortOrder: "asc" } }),
    db.expense.findMany({ orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }], include: { paidBy: { select: { name: true } } } }),
    getSettings(),
    db.user.findMany({ orderBy: { id: "asc" } }),
  ]);
  const s = summarizeBudget({ budgetItems, expenses, ...settings });
  const dates = Object.keys(s.byDate).sort().reverse();
  const tax = summarizeTaxFree(expenses, settings.usdRate);

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
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl">날짜별 지출</h2>
          <a href="/api/expenses.csv" download className="inline-flex min-h-11 items-center text-sm">
            CSV 내려받기
          </a>
        </div>
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

      <section className="flex flex-col gap-3">
        <h2 className="text-xl">택스리펀드·면세 한도</h2>
        <div className="flex flex-col gap-1 rounded-[10px] border border-line bg-surface px-4 py-3.5 text-sm">
          <span className="flex justify-between">
            <span className="text-muted">환급 예상</span>
            <span className="mono">{formatEur(tax.refund.expected)}</span>
          </span>
          <span className="flex justify-between text-xs text-muted">
            <span>서류 받음 · 공항 확인 · 환급 완료</span>
            <span className="mono">
              {formatEur(tax.refund.byStatus.form)} · {formatEur(tax.refund.byStatus.validated)} · {formatEur(tax.refund.byStatus.refunded)}
            </span>
          </span>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {users.map((u) => {
            const spent = tax.shoppingByUser[u.id] ?? 0;
            const over = tax.limitKrw != null && spent > tax.limitKrw;
            return (
              <li key={u.id} className="flex flex-wrap justify-between gap-x-3">
                <span>{u.name} 쇼핑</span>
                <span className="mono">
                  <span className={over ? "font-semibold text-warn" : ""}>{formatKrw(spent)}</span>
                  {tax.limitKrw != null && <span className="text-muted"> / {formatKrw(tax.limitKrw)}</span>}
                </span>
                {over && <span className="basis-full text-right text-xs font-semibold text-warn">면세 한도 초과 · 입국 때 세관 신고 대상</span>}
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted">
          {tax.limitKrw == null
            ? `1인 면세 한도(미화 ${DUTY_FREE_LIMIT_USD}달러)와 비교하려면 아래에 달러 환율을 입력하세요.`
            : `항목이 쇼핑인 지출을 결제한 사람별로 더해 1인 면세 한도(미화 ${DUTY_FREE_LIMIT_USD}달러)와 비교합니다.`}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl">환율·예비비</h2>
        <SettingForm name="fx_eur_krw" label="€1당 원화" unit="원" initial={settings.fxRate} />
        <SettingForm name="reserve_pct" label="예비비 비율" unit="%" initial={settings.reservePct} />
        <SettingForm name="fx_usd_krw" label="$1당 원화 (면세 한도 비교용)" unit="원" initial={settings.usdRate} />
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
