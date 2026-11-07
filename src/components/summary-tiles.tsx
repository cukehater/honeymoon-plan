import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BudgetSummary } from "@/lib/budget";
import { formatKrw } from "@/lib/format";
import { Card } from "./ui";

// 토스식 경비 요약: 총액을 크게, 그 아래 1인당과 세부 세 줄
export function SummaryTiles({ s, href }: { s: BudgetSummary; href?: string }) {
  const rows = [
    { k: "결제 완료", v: s.paid },
    { k: "추가 예상", v: s.estimated },
    { k: "예비비", v: s.reserve },
  ];
  const head = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[13px] font-semibold text-muted">총 예상 경비</span>
        <span className="mono text-[30px] leading-tight font-bold tracking-tight">{formatKrw(s.total)}</span>
        <span className="text-sm text-muted">
          1인당 <b className="mono font-semibold text-fg">{formatKrw(s.perPerson)}</b>
        </span>
      </div>
      {href && <ChevronRight size={22} className="mt-1 shrink-0 text-muted" aria-hidden />}
    </div>
  );
  return (
    <Card>
      {href ? (
        <Link href={href} className="block text-fg no-underline">
          {head}
        </Link>
      ) : (
        head
      )}
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
        {rows.map((r) => (
          <div key={r.k} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-muted">{r.k}</dt>
            <dd className="mono truncate text-[15px] font-semibold">{formatKrw(r.v)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
