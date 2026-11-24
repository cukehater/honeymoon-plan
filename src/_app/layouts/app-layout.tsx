import { Suspense } from 'react'

import { TabBar, TabBarLinks } from '@/widgets/tab-bar'

import { ServiceWorker } from '../pwa/service-worker'

export const AppLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-[calc(10rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <ServiceWorker />
      <Suspense fallback={<TabBarLinks pathname={null} />}>
        <TabBar />
      </Suspense>
    </>
  )
}
