// 데이터가 오는 동안 보이는 회색 카드 자리
export default function Loading() {
  return (
    <div role="status" aria-label="불러오는 중" className="flex flex-col gap-4 pt-2">
      <span className="h-9 w-32 animate-pulse rounded-[12px] bg-surface motion-reduce:animate-none" />
      <span className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface motion-reduce:animate-none" />
      <span className="h-56 animate-pulse rounded-[var(--radius-card)] bg-surface motion-reduce:animate-none" />
    </div>
  );
}
