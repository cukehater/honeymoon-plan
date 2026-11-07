"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { toMapQuery } from "@/lib/map-query";
import { getSession } from "@/lib/session";
import type { FormState } from "@/lib/use-safe-action";

const Id = z.coerce.number().int().positive();
const Time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "시각은 09:30처럼 입력하세요.");
const Description = z.string().trim().max(1000).transform((s) => s || null);

const UpdateInput = z.object({ id: Id, startTime: Time, description: Description });

const CreateInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: Time,
  title: z.string().trim().min(1, "제목을 입력하세요.").max(200),
  kind: z.enum(["activity", "meal", "flight", "transfer", "rest"]),
  description: Description,
});

const formObject = (formData: FormData) => Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));

function revalidateItinerary(date: string) {
  revalidatePath("/itinerary");
  revalidatePath(`/itinerary/${date}`);
  revalidatePath("/");
}

export async function updateItineraryItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await getSession();
  const parsed = UpdateInput.safeParse(formObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...data } = parsed.data;
  try {
    const item = await db.itineraryItem.update({ where: { id }, data });
    revalidateItinerary(item.date);
  } catch {
    return { error: "저장하지 못했습니다. 다시 시도해 주세요." };
  }
  return {};
}

export async function setItineraryItemHidden(id: number, hidden: boolean): Promise<FormState> {
  await getSession();
  const input = z.object({ id: Id, hidden: z.boolean() }).parse({ id, hidden });
  try {
    const item = await db.itineraryItem.update({ where: { id: input.id }, data: { hidden: input.hidden } });
    revalidateItinerary(item.date);
  } catch {
    return { error: "저장하지 못했습니다. 다시 시도해 주세요." };
  }
  return {};
}

export async function createItineraryItem(_prev: FormState, formData: FormData): Promise<FormState> {
  await getSession();
  const parsed = CreateInput.safeParse(formObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;
  try {
    const day = await db.tripDay.findUnique({ where: { date: input.date } });
    if (!day) return { error: "여행 날짜가 아닙니다." };
    const last = await db.itineraryItem.aggregate({ where: { date: input.date }, _max: { sortOrder: true } });
    await db.itineraryItem.create({
      data: {
        ...input,
        mapQuery: toMapQuery(input.title, input.kind, day.city),
        sortOrder: (last._max.sortOrder ?? 0) + 1,
      },
    });
  } catch {
    return { error: "저장하지 못했습니다. 다시 시도해 주세요." };
  }
  revalidateItinerary(input.date);
  return {};
}
