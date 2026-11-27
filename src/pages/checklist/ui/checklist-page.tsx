import { db } from '@/shared/db'
import { getSession } from '@/shared/lib/session'
import { PageHeader } from '@/shared/ui/primitives'

import { ChecklistView } from './checklist-view'

export const metadata = { title: '체크리스트' }

export const ChecklistPage = async () => {
  await getSession()
  const groups = await db.query.checklistGroup.findMany({
    orderBy: (g, { asc }) => asc(g.sortOrder),
    with: { items: { orderBy: (i, { asc }) => asc(i.sortOrder) } },
  })
  return (
    <>
      <PageHeader title="체크리스트" />
      <ChecklistView groups={groups} />
    </>
  )
}
