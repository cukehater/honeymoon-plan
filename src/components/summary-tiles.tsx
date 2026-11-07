import type { BudgetSummary } from "@/lib/budget";
import { formatKrw } from "@/lib/format";

export function SummaryTiles({ s }: { s: BudgetSummary }) {
  const tiles = [
    { k: "결제 완료", v: s.paid },
    { k: "추가 예상", v: s.estimated + s.reserve, note: `예비비 ${formatKrw(s.reserve)} 포함` },
    { k: "1인당", v: s.perPerson },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((t) => (
        <div key={t.k} className="flex min-w-0 flex-col gap-0.5 rounded-[10px] border border-line bg-surface px-4 py-3.5">
          <span className="text-xs text-muted">{t.k}</span>
          <span className="mono text-lg sm:text-xl">{formatKrw(t.v)}</span>
          {t.note && <span className="text-[11px] text-muted">{t.note}</span>}
        </div>
      ))}
      <div className="flex min-w-0 flex-col gap-0.5 rounded-[10px] bg-fg px-4 py-3.5 text-bg">
        <span className="text-xs opacity-75">총 예상 경비</span>
        <span className="mono text-xl sm:text-2xl">{formatKrw(s.total)}</span>
      </div>
    </div>
  );
}
