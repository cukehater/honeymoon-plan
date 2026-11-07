import Link from "next/link";
import { TabBar } from "@/components/tab-bar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pt-6 pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <Link
        href="/expenses/new"
        className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 flex min-h-12 items-center rounded-full bg-fg px-5 font-semibold text-bg no-underline shadow-lg"
      >
        + 지출 추가
      </Link>
      <TabBar />
    </>
  );
}
