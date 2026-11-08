import Link from "next/link";
import { Download, Plus, Receipt } from "lucide-react";
import { SummaryTiles } from "@/components/summary-tiles";
import { CATEGORY_ICON, CATEGORY_TONE } from "@/components/travel";
import { Card, IconTile, PageHeader, ProgressBar, SectionTitle } from "@/components/ui";
import { CATEGORIES, CATEGORY_LABEL, summarizeExpenses } from "@/lib/budget";
import { db } from "@/lib/db";
import { formatDate, formatEur, formatKrw } from "@/lib/format";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SettingForm } from "./settings-forms";

export const metadata = { title: "경비" };

export default async function ExpensesPage() {
  await getSession();
  const [expenses, settings] = await Promise.all([
    db.expense.findMany({ orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }], include: { paidBy: { select: { name: true } } } }),
    getSettings(),
  ]);
  const s = summarizeExpenses(expenses);
  const dates = Object.keys(s.byDate).sort().reverse();

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

      {s.total > 0 && (
        <Card>
          <SectionTitle>항목별 지출</SectionTitle>
          <ul className="flex flex-col gap-4">
            {CATEGORIES.filter((c) => s.byCategory[c] > 0)
              .sort((a, b) => s.byCategory[b] - s.byCategory[a])
              .map((c) => (
                <li key={c} className="flex items-center gap-3">
                  <IconTile icon={CATEGORY_ICON[c]} tone={CATEGORY_TONE[c]} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <span className="text-[15px] font-semibold">{CATEGORY_LABEL[c]}</span>
                      <span className="mono text-[14px] font-semibold">
                        {formatKrw(s.byCategory[c])}
                        <span className="ml-1.5 text-[12px] font-normal text-muted">{Math.round((s.byCategory[c] / s.total) * 100)}%</span>
                      </span>
                    </div>
                    <ProgressBar value={s.byCategory[c]} max={s.total} label={`${CATEGORY_LABEL[c]} 비중`} />
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      )}

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
        <SectionTitle>환율</SectionTitle>
        <SettingForm name="fx_eur_krw" label="€1당 원화 (새로 기록하는 유로 지출에 적용)" unit="원" initial={settings.fxRate} />
      </Card>
    </>
  );
}
