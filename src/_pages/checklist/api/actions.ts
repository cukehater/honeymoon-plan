'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { checklistItem, db } from '@/shared/db'
import { getSession } from '@/shared/lib/session'

const ToggleInput = z.object({ id: z.number().int().positive(), checked: z.boolean() })

export const toggleChecklistItem = async (id: number, checked: boolean) => {
  const { userId } = await getSession()
  const input = ToggleInput.parse({ id, checked })
  await db
    .update(checklistItem)
    .set(
      input.checked
        ? { checkedById: userId, checkedAt: new Date() }
        : { checkedById: null, checkedAt: null },
    )
    .where(eq(checklistItem.id, input.id))
  revalidatePath('/checklist')
  revalidatePath('/')
}
