"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { checklistItem } from "@/db/schema";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const ToggleInput = z.object({ id: z.number().int().positive(), checked: z.boolean() });

export async function toggleChecklistItem(id: number, checked: boolean) {
  const { userId } = await getSession();
  const input = ToggleInput.parse({ id, checked });
  await db
    .update(checklistItem)
    .set(input.checked ? { checkedById: userId, checkedAt: new Date() } : { checkedById: null, checkedAt: null })
    .where(eq(checklistItem.id, input.id));
  revalidatePath("/checklist");
  revalidatePath("/");
}
