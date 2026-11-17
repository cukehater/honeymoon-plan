// docs/seed-data.json을 DB에 넣는다. 이미 데이터가 있으면 아무것도 하지 않는다.
// --force: 참고 데이터를 지우고 다시 넣는다. 단 Expense가 1건이라도 있으면 거부한다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { count } from "drizzle-orm";
import { db } from "../lib/db";
import { toMapQuery } from "../lib/map-query";
import {
  booking,
  budgetItem,
  checklistGroup,
  checklistItem,
  dayAlert,
  expense,
  itineraryItem,
  setting,
  tripDay,
  user,
  type BookingKind,
  type BookingNeed,
  type BudgetStatus,
  type Category,
  type City,
  type Currency,
  type ItemKind,
} from "./schema";

type SeedData = {
  users: { id: number; name: string }[];
  settings: { fx_eur_krw: number; reserve_pct: number };
  tripDays: { date: string; city: City; tz: string; title: string; note: string | null }[];
  dayAlerts: { date: string | null; title: string; body: string }[];
  itineraryItems: {
    date: string;
    startTime: string;
    title: string;
    description: string | null;
    kind: ItemKind;
    booking: BookingNeed;
    isKey: boolean;
    sortOrder: number;
  }[];
  checklistGroups: {
    title: string;
    urgent: boolean;
    sortOrder: number;
    items: {
      title: string;
      detail: string | null;
      dueNote: string | null;
      checked: boolean;
      sortOrder: number;
    }[];
  }[];
  bookings: {
    kind: BookingKind;
    title: string;
    refCode: string | null;
    startsAt: string;
    endsAt: string | null;
    address: string | null;
    phone: string | null;
    detail: string | null;
  }[];
  budgetItems: {
    category: Category;
    title: string;
    status: BudgetStatus;
    currency: Currency;
    amountMinor: number;
    note: string | null;
    sortOrder: number;
  }[];
};

// "10/31 16:00" → 2026-10-31T16:00:00Z. 날짜 형식이 아니면 null.
function parseDueNote(note: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2}) (\d{2}):(\d{2})$/.exec(note);
  if (!m) return null;
  const [, mo, d, h, mi] = m.map(Number);
  return new Date(Date.UTC(2026, mo - 1, d, h, mi));
}

async function main() {
  const force = process.argv.includes("--force");
  const data: SeedData = JSON.parse(
    readFileSync(join(import.meta.dirname, "../../docs/seed-data.json"), "utf8"),
  );

  const [days] = await db.select({ n: count() }).from(tripDay);
  if (days.n > 0) {
    if (!force) {
      console.log("이미 시드 데이터가 있습니다. 다시 넣으려면 --force");
      return;
    }
    const [{ n: expenses }] = await db.select({ n: count() }).from(expense);
    if (expenses > 0) {
      throw new Error(`지출 ${expenses}건이 있어 --force를 거부합니다.`);
    }
  }

  const cityOf = new Map(data.tripDays.map((d) => [d.date, d.city]));
  const now = new Date();

  await db.transaction(async (tx) => {
    if (force) {
      for (const t of [checklistItem, checklistGroup, itineraryItem, dayAlert, tripDay, booking, budgetItem, setting, user]) {
        await tx.delete(t);
      }
    }

    await tx.insert(user).values(data.users);
    await tx.insert(setting).values([
      { key: "fx_eur_krw", value: JSON.stringify(data.settings.fx_eur_krw) },
      { key: "reserve_pct", value: JSON.stringify(data.settings.reserve_pct) },
    ]);
    await tx.insert(tripDay).values(data.tripDays);
    await tx.insert(dayAlert).values(data.dayAlerts);
    await tx.insert(itineraryItem).values(
      data.itineraryItems.map((i) => ({
        date: i.date,
        startTime: i.startTime,
        title: i.title,
        description: i.description,
        kind: i.kind,
        booking: i.booking,
        isKey: i.isKey,
        sortOrder: i.sortOrder,
        mapQuery: toMapQuery(i.title, i.kind, cityOf.get(i.date)!),
      })),
    );
    for (const g of data.checklistGroups) {
      const [group] = await tx
        .insert(checklistGroup)
        .values({ title: g.title, urgent: g.urgent, sortOrder: g.sortOrder })
        .returning({ id: checklistGroup.id });
      await tx.insert(checklistItem).values(
        g.items.map((i) => {
          const dueAt = i.dueNote ? parseDueNote(i.dueNote) : null;
          const memo = i.dueNote && !dueAt ? i.dueNote : null;
          return {
            groupId: group.id,
            title: i.title,
            detail: memo ? [memo, i.detail].filter(Boolean).join(" · ") : i.detail,
            dueAt,
            checkedById: i.checked ? 1 : null,
            checkedAt: i.checked ? now : null,
            sortOrder: i.sortOrder,
          };
        }),
      );
    }
    await tx.insert(booking).values(data.bookings);
    await tx.insert(budgetItem).values(data.budgetItems);
  });

  console.log("시드 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
