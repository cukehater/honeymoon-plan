import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ChevronLeft, type LucideProps } from "lucide-react";

export type Icon = ComponentType<LucideProps>;

// 흰 카드 한 장. 회색 바탕 위에서 테두리·그림자 없이 면으로 구분한다.
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[var(--radius-card)] bg-surface p-5 ${className}`}>{children}</section>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
      <h2 className="text-[17px]">{children}</h2>
      {action}
    </div>
  );
}

const TONE = {
  accent: "bg-accent-soft text-accent-ink",
  warn: "bg-warn-soft text-warn",
  caution: "bg-caution-soft text-caution",
  ok: "bg-ok-soft text-ok",
  neutral: "bg-surface-2 text-muted",
} as const;
export type Tone = keyof typeof TONE;

export function IconTile({ icon: I, tone = "neutral", size = 40 }: { icon: Icon; tone?: Tone; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[12px] ${TONE[tone]}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <I size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${TONE[tone]}`}>
      {children}
    </span>
  );
}

// iOS식 큰 제목. back이 있으면 왼쪽 위에 뒤로 가기.
export function PageHeader({ title, back, action }: { title: ReactNode; back?: { href: string; label: string }; action?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1 pt-2">
      {back && (
        <Link href={back.href} className="-ml-2 inline-flex min-h-11 w-fit items-center gap-0.5 pr-2 text-[15px] font-semibold text-fg no-underline">
          <ChevronLeft size={22} aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-[28px]">{title}</h1>
        {action}
      </div>
    </header>
  );
}

export function ProgressBar({ value, max, tone = "accent", label }: { value: number; max: number; tone?: "accent" | "ok" | "warn"; label: string }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  const fill = tone === "ok" ? "bg-ok" : tone === "warn" ? "bg-warn" : "bg-accent";
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-2 overflow-hidden rounded-full bg-surface-2">
      <i className={`block h-full rounded-full ${fill} transition-[width] duration-300 motion-reduce:transition-none`} style={{ width: `${pct}%` }} />
    </div>
  );
}
