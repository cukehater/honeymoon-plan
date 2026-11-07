import { Suspense } from "react";
import { ServiceWorker } from "@/components/service-worker";
import { TabBar, TabBarLinks } from "@/components/tab-bar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pt-6 pb-[calc(9rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <ServiceWorker />
      <Suspense fallback={<TabBarLinks pathname={null} />}>
        <TabBar />
      </Suspense>
    </>
  );
}
