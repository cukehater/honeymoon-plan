import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import type { ExpenseSummaryType } from '@/entities/expense'
import { formatKrw } from '@/shared/lib/format'
import { Card } from '@/shared/ui/primitives'

// 토스식 지출 요약: 총 지출을 크게, 그 아래 건수
export const SummaryTiles = ({ s, href }: { s: ExpenseSummaryType; href?: string }) => {
  const body = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[13px] font-semibold text-muted">총 지출</span>
        <span className="mono text-[30px] leading-tight font-bold tracking-tight">
          {formatKrw(s.total)}
        </span>
        <span className="text-sm text-muted">
          <span className="mono">{s.count}</span>건
        </span>
      </div>
      {href && <ChevronRight aria-hidden className="mt-1 shrink-0 text-muted" size={22} />}
    </div>
  )
  return (
    <Card>
      {href ? (
        <Link className="block text-fg no-underline" href={href}>
          {body}
        </Link>
      ) : (
        body
      )}
    </Card>
  )
}
