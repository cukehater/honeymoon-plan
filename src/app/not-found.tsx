import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-5 py-12">
      <h1 className="text-2xl">페이지를 찾을 수 없어요</h1>
      <p className="text-muted">주소가 바뀌었거나 삭제된 항목이에요.</p>
      <Link href="/" className="inline-flex min-h-11 items-center">
        홈으로
      </Link>
    </main>
  );
}
