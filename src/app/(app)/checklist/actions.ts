"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const ToggleInput = z.object({ id: z.number().int().positive(), checked: z.boolean() });

export async function toggleChecklistItem(id: number, checked: boolean) {
  const { userId } = await getSession();
  const input = ToggleInput.parse({ id, checked });
  await db.checklistItem.update({
    where: { id: input.id },
    data: input.checked ? { checkedById: userId, checkedAt: new Date() } : { checkedById: null, checkedAt: null },
  });
  revalidatePath("/checklist");
  revalidatePath("/");
}
