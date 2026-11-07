import Link from "next/link";
import { ChevronRight, Download, Plus, Receipt } from "lucide-react";
import { SummaryTiles } from "@/components/summary-tiles";
import { CATEGORY_ICON, CATEGORY_TONE } from "@/components/travel";
import { Badge, Card, IconTile, PageHeader, ProgressBar, SectionTitle } from "@/components/ui";
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
      <PageHeader
        title="경비"
        action={
          <a href="/api/expenses.csv" download className="press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface px-4 text-[13px] font-semibold text-fg no-underline">
            <Download size={16} aria-hidden />
            CSV
          </a>
        }
      />
      <SummaryTiles s={s} />

      <Card>
        <SectionTitle>항목별 예산 대비 실제</SectionTitle>
        <ul className="flex flex-col gap-4">
          {CATEGORIES.map((c) => {
            const t = s.byCategory[c];
            if (t.budget === 0 && t.actual === 0) return null;
            const over = t.actual > t.budget;
            return (
              <li key={c} className="flex items-center gap-3">
                <IconTile icon={CATEGORY_ICON[c]} tone={CATEGORY_TONE[c]} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="text-[15px] font-semibold">{CATEGORY_LABEL[c]}</span>
                    <span className="mono text-[13px] text-muted">
                      <b className={`font-semibold ${over ? "text-warn" : "text-fg"}`}>{formatKrw(t.actual)}</b> / {formatKrw(t.budget)}
                    </span>
                  </div>
                  <ProgressBar value={t.actual} max={t.budget || t.actual} tone={over ? "warn" : "accent"} label={`${CATEGORY_LABEL[c]} 예산 사용`} />
                  {over && <span className="text-[12px] font-semibold text-warn">예산 초과</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[12px] text-muted">실제는 기록한 지출만 셉니다. 결제 완료로 잡은 예산은 위 &lsquo;결제 완료&rsquo;에 들어 있어요.</p>
      </Card>

      <Card>
        <SectionTitle>지출 내역</SectionTitle>
        {dates.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <IconTile icon={Receipt} size={48} />
            <p className="text-[15px] font-semibold">아직 기록한 지출이 없어요</p>
            <Link href="/expenses/new" className="press inline-flex min-h-11 items-center gap-1 rounded-full bg-accent-soft px-4 text-[14px] font-semibold text-accent-ink no-underline">
              <Plus size={16} aria-hidden />
              첫 지출 기록하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {dates.map((d) => (
              <div key={d}>
                <div className="mb-1 flex justify-between text-[13px] font-semibold text-muted">
                  <span className="mono">{formatDate(d)}</span>
                  <span className="mono">{formatKrw(s.byDate[d])}</span>
                </div>
                <ul>
                  {expenses
                    .filter((e) => e.spentOn === d)
                    .map((e) => (
                      <li key={e.id}>
                        <Link href={`/expenses/${e.id}`} className="press -mx-2 flex min-h-14 items-center gap-3 rounded-[14px] px-2 py-2 text-fg no-underline hover:bg-surface-2">
                          <IconTile icon={CATEGORY_ICON[e.category]} tone={CATEGORY_TONE[e.category]} />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[15px] font-semibold">{e.title}</span>
                            <span className="truncate text-[13px] text-muted">
                              {e.method === "card" ? "카드" : "현금"} · {e.paidBy.name}
                              {e.memo && ` · ${e.memo}`}
                            </span>
                          </span>
                          <span className="mono flex shrink-0 flex-col items-end">
                            <span className="text-[15px] font-bold">{formatKrw(e.amountKrw)}</span>
                            {e.currency === "EUR" && <span className="text-[12px] text-muted">{formatEur(e.amountMinor)}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>택스리펀드 · 면세 한도</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[14px] bg-surface-2 p-3">
            <span className="text-[12px] font-semibold text-muted">환급 예상</span>
            <p className="mono text-[18px] font-bold">{formatEur(tax.refund.expected)}</p>
          </div>
          <div className="rounded-[14px] bg-surface-2 p-3">
            <span className="text-[12px] font-semibold text-muted">환급 완료</span>
            <p className="mono text-[18px] font-bold">{formatEur(tax.refund.byStatus.refunded)}</p>
          </div>
        </div>
        <p className="mono mt-2 text-[12px] text-muted">
          서류 받음 {formatEur(tax.refund.byStatus.form)} · 공항 확인 {formatEur(tax.refund.byStatus.validated)}
        </p>
        <ul className="mt-4 flex flex-col gap-4">
          {users.map((u) => {
            const spent = tax.shoppingByUser[u.id] ?? 0;
            const over = tax.limitKrw != null && spent > tax.limitKrw;
            return (
              <li key={u.id} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                    {u.name} 쇼핑
                    {over && <Badge tone="warn">한도 초과 · 입국 때 신고</Badge>}
                  </span>
                  <span className="mono text-[13px] text-muted">
                    <b className={`font-semibold ${over ? "text-warn" : "text-fg"}`}>{formatKrw(spent)}</b>
                    {tax.limitKrw != null && ` / ${formatKrw(tax.limitKrw)}`}
                  </span>
                </div>
                {tax.limitKrw != null && <ProgressBar value={spent} max={tax.limitKrw} tone={over ? "warn" : "accent"} label={`${u.name} 면세 한도 사용`} />}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[12px] text-muted">
          {tax.limitKrw == null
            ? `1인 면세 한도(미화 ${DUTY_FREE_LIMIT_USD}달러)와 비교하려면 아래에 달러 환율을 입력하세요.`
            : `항목이 쇼핑인 지출을 결제한 사람별로 더해 1인 면세 한도(미화 ${DUTY_FREE_LIMIT_USD}달러)와 비교합니다.`}
        </p>
      </Card>

      <Card className="flex flex-col gap-5">
        <SectionTitle>환율 · 예비비</SectionTitle>
        <SettingForm name="fx_eur_krw" label="€1당 원화" unit="원" initial={settings.fxRate} />
        <SettingForm name="reserve_pct" label="예비비 비율" unit="%" initial={settings.reservePct} />
        <SettingForm name="fx_usd_krw" label="$1당 원화 (면세 한도 비교용)" unit="원" initial={settings.usdRate} />
      </Card>

      <Card>
        <SectionTitle>예산 항목</SectionTitle>
        <ul className="flex flex-col">
          {budgetItems.map((b) => (
            <li key={b.id} className="border-t border-line first:border-t-0">
              <details className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 py-2 [&::-webkit-details-marker]:hidden">
                  <IconTile icon={CATEGORY_ICON[b.category]} tone={CATEGORY_TONE[b.category]} size={36} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px] font-semibold">{b.title}</span>
                    <span className="text-[12px] text-muted">
                      {CATEGORY_LABEL[b.category]} · <span className={b.status === "paid" ? "font-semibold text-ok" : ""}>{b.status === "paid" ? "결제 완료" : "예상"}</span>
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[15px] font-semibold">{b.currency === "EUR" ? formatEur(b.amountMinor) : formatKrw(b.amountMinor)}</span>
                  <ChevronRight size={18} className="shrink-0 text-muted transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                <div className="pb-4">
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
                </div>
              </details>
            </li>
          ))}
        </ul>
        <details className="group mt-2 border-t border-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 text-[15px] font-semibold text-accent-ink [&::-webkit-details-marker]:hidden">
            <Plus size={18} aria-hidden />
            예산 항목 추가
          </summary>
          <BudgetItemForm initial={{ category: "etc", title: "", status: "estimated", currency: "EUR", amount: "", note: "" }} />
        </details>
      </Card>
    </>
  );
}
