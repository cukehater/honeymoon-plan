"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-5 py-12">
      <h1 className="text-2xl">불러오지 못했어요</h1>
      <p className="text-muted">통신이 끊겼거나 데이터베이스에 연결하지 못했을 수 있어요. 잠시 뒤 다시 시도해 주세요.</p>
      <button type="button" onClick={() => retry()} className="min-h-11 rounded-lg bg-fg font-bold text-bg">
        다시 시도
      </button>
    </main>
  );
}
