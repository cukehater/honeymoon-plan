import { db } from '@/shared/db'
import { getSession } from '@/shared/lib/session'
import { PageHeader } from '@/shared/ui/primitives'

import { ChecklistView } from './checklist-view'

export const metadata = { title: '체크리스트' }

export const ChecklistPage = async () => {
  const { userId } = await getSession()
  const [groups, me] = await Promise.all([
    db.query.checklistGroup.findMany({
      orderBy: (g, { asc }) => asc(g.sortOrder),
      with: {
        items: {
          orderBy: (i, { asc }) => asc(i.sortOrder),
          with: { checkedBy: { columns: { name: true } } },
        },
      },
    }),
    db.query.user.findFirst({ where: (u, { eq }) => eq(u.id, userId) }),
  ])
  if (!me) throw new Error(`user ${userId} not found`)
  return (
    <>
      <PageHeader title="체크리스트" />
      <ChecklistView groups={groups} myName={me.name} />
    </>
  )
}
