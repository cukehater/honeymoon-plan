// docs/seed-data.json을 DB에 넣는다. 이미 데이터가 있으면 아무것도 하지 않는다.
// --force: 참고 데이터를 지우고 다시 넣는다. 단 Expense가 1건이라도 있으면 거부한다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../src/lib/db";
import { toMapQuery } from "../src/lib/map-query";
import type {
  BookingKind,
  BookingNeed,
  BudgetStatus,
  Category,
  City,
  Currency,
  ItemKind,
} from "../src/generated/prisma/client";

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
    readFileSync(join(import.meta.dirname, "../docs/seed-data.json"), "utf8"),
  );

  if ((await db.tripDay.count()) > 0) {
    if (!force) {
      console.log("이미 시드 데이터가 있습니다. 다시 넣으려면 --force");
      return;
    }
    const expenses = await db.expense.count();
    if (expenses > 0) {
      throw new Error(`지출 ${expenses}건이 있어 --force를 거부합니다.`);
    }
  }

  const cityOf = new Map(data.tripDays.map((d) => [d.date, d.city]));
  const now = new Date();

  await db.$transaction(async (tx) => {
    if (force) {
      await tx.checklistItem.deleteMany();
      await tx.checklistGroup.deleteMany();
      await tx.itineraryItem.deleteMany();
      await tx.dayAlert.deleteMany();
      await tx.tripDay.deleteMany();
      await tx.booking.deleteMany();
      await tx.budgetItem.deleteMany();
      await tx.setting.deleteMany();
      await tx.user.deleteMany();
    }

    await tx.user.createMany({ data: data.users });
    await tx.setting.createMany({
      data: [
        { key: "fx_eur_krw", value: JSON.stringify(data.settings.fx_eur_krw) },
        { key: "reserve_pct", value: JSON.stringify(data.settings.reserve_pct) },
      ],
    });
    await tx.tripDay.createMany({ data: data.tripDays });
    await tx.dayAlert.createMany({ data: data.dayAlerts });
    await tx.itineraryItem.createMany({
      data: data.itineraryItems.map((i) => ({
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
    });
    for (const g of data.checklistGroups) {
      await tx.checklistGroup.create({
        data: {
          title: g.title,
          urgent: g.urgent,
          sortOrder: g.sortOrder,
          items: {
            create: g.items.map((i) => {
              const dueAt = i.dueNote ? parseDueNote(i.dueNote) : null;
              const memo = i.dueNote && !dueAt ? i.dueNote : null;
              return {
                title: i.title,
                detail: memo ? [memo, i.detail].filter(Boolean).join(" · ") : i.detail,
                dueAt,
                checkedById: i.checked ? 1 : null,
                checkedAt: i.checked ? now : null,
                sortOrder: i.sortOrder,
              };
            }),
          },
        },
      });
    }
    await tx.booking.createMany({ data: data.bookings });
    await tx.budgetItem.createMany({ data: data.budgetItems });
  });

  console.log("시드 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
