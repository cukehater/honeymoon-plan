import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ExpenseSummary } from "@/lib/budget";
import { formatKrw } from "@/lib/format";
import { Card } from "./ui";

// 토스식 지출 요약: 총 지출을 크게, 그 아래 1인당과 건수
export function SummaryTiles({ s, href }: { s: ExpenseSummary; href?: string }) {
  const body = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[13px] font-semibold text-muted">총 지출</span>
        <span className="mono text-[30px] leading-tight font-bold tracking-tight">{formatKrw(s.total)}</span>
        <span className="text-sm text-muted">
          1인당 <b className="mono font-semibold text-fg">{formatKrw(s.perPerson)}</b> · <span className="mono">{s.count}</span>건
        </span>
      </div>
      {href && <ChevronRight size={22} className="mt-1 shrink-0 text-muted" aria-hidden />}
    </div>
  );
  return (
    <Card>
      {href ? (
        <Link href={href} className="block text-fg no-underline">
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  );
}
