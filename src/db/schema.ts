// src/db/schema.ts — Drizzle ORM, Postgres(Neon)
import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const cityEnum = pgEnum("City", ["paris", "porto", "barcelona"]);
export const categoryEnum = pgEnum("Category", ["air", "stay", "food", "tour", "transport", "shopping", "etc"]);
export const currencyEnum = pgEnum("Currency", ["EUR", "KRW"]);
export const itemKindEnum = pgEnum("ItemKind", ["activity", "meal", "flight", "transfer", "rest"]);
export const bookingNeedEnum = pgEnum("BookingNeed", ["none", "required", "done"]);
export const bookingKindEnum = pgEnum("BookingKind", ["flight", "stay", "activity"]);
export const budgetStatusEnum = pgEnum("BudgetStatus", ["paid", "estimated"]);
export const payMethodEnum = pgEnum("PayMethod", ["card", "cash"]);
export const taxFreeStatusEnum = pgEnum("TaxFreeStatus", ["form", "validated", "refunded"]);

export type City = (typeof cityEnum.enumValues)[number];
export type Category = (typeof categoryEnum.enumValues)[number];
export type Currency = (typeof currencyEnum.enumValues)[number];
export type ItemKind = (typeof itemKindEnum.enumValues)[number];
export type BookingNeed = (typeof bookingNeedEnum.enumValues)[number];
export type BookingKind = (typeof bookingKindEnum.enumValues)[number];
export type BudgetStatus = (typeof budgetStatusEnum.enumValues)[number];

// 사용자 2명
export const user = pgTable("app_user", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
});

// 여행 날짜 (11/30~12/7, 8행)
export const tripDay = pgTable("trip_day", {
  date: text("date").primaryKey(), // '2026-11-30'
  city: cityEnum("city").notNull(),
  tz: text("tz").notNull(), // 'Europe/Lisbon' | 'Europe/Madrid'
  title: text("title").notNull(),
  note: text("note"),
});

// 날짜별 주의사항 (환승 65분, 공휴일). date가 null이면 여행 전체
export const dayAlert = pgTable("day_alert", {
  id: serial("id").primaryKey(),
  date: text("date").references(() => tripDay.date),
  title: text("title").notNull(),
  body: text("body").notNull(),
});

export const itineraryItem = pgTable(
  "itinerary_item",
  {
    id: serial("id").primaryKey(),
    date: text("date")
      .notNull()
      .references(() => tripDay.date),
    startTime: text("start_time").notNull(), // '15:00' 현지 시각
    title: text("title").notNull(),
    description: text("description"),
    kind: itemKindEnum("kind").notNull(),
    booking: bookingNeedEnum("booking").notNull().default("none"),
    isKey: boolean("is_key").notNull().default(false),
    mapQuery: text("map_query"), // 구글 지도 검색어
    sortOrder: integer("sort_order").notNull(),
    hidden: boolean("hidden").notNull().default(false),
  },
  (t) => [index("itinerary_item_date_sort_order_idx").on(t.date, t.sortOrder)],
);

export const checklistGroup = pgTable("checklist_group", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  urgent: boolean("urgent").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
});

export const checklistItem = pgTable("checklist_item", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => checklistGroup.id),
  title: text("title").notNull(),
  detail: text("detail"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  checkedById: integer("checked_by").references(() => user.id),
  checkedAt: timestamp("checked_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull(),
});

export const booking = pgTable("booking", {
  id: serial("id").primaryKey(),
  kind: bookingKindEnum("kind").notNull(),
  title: text("title").notNull(),
  refCode: text("ref_code"),
  startsAt: text("starts_at").notNull(), // 현지 오프셋 포함 ISO 8601
  endsAt: text("ends_at"),
  address: text("address"),
  phone: text("phone"),
  detail: text("detail"),
});

// 계획: 결제 완료 또는 예상 금액
export const budgetItem = pgTable("budget_item", {
  id: serial("id").primaryKey(),
  category: categoryEnum("category").notNull(),
  title: text("title").notNull(),
  status: budgetStatusEnum("status").notNull(),
  currency: currencyEnum("currency").notNull(),
  amountMinor: integer("amount_minor").notNull(), // EUR은 센트, KRW는 원
  note: text("note"),
  sortOrder: integer("sort_order").notNull(),
});

// 실제 지출
export const expense = pgTable(
  "expense",
  {
    id: serial("id").primaryKey(),
    spentOn: text("spent_on").notNull(), // '2026-12-05'
    city: cityEnum("city").notNull(),
    category: categoryEnum("category").notNull(),
    title: text("title").notNull(),
    currency: currencyEnum("currency").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    fxRate: doublePrecision("fx_rate").notNull(), // KRW이면 1
    amountKrw: integer("amount_krw").notNull(), // 카드 청구 후 수정 가능
    method: payMethodEnum("method").notNull(),
    paidById: integer("paid_by")
      .notNull()
      .references(() => user.id),
    budgetItemId: integer("budget_item_id").references(() => budgetItem.id),
    itineraryItemId: integer("itinerary_item_id").references(() => itineraryItem.id),
    taxFreeMinor: integer("tax_free_minor"), // P1: 환급 예상액(유로 센트)
    taxFreeStatus: taxFreeStatusEnum("tax_free_status"),
    memo: text("memo"),
    createdById: integer("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("expense_spent_on_idx").on(t.spentOn), index("expense_category_idx").on(t.category)],
);

// 설정: fx_eur_krw = 1544, reserve_pct = 10, fx_usd_krw = $1당 원(P1 면세 한도 비교, 사용자가 입력) (value는 JSON 문자열)
export const setting = pgTable("setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  checkedItems: many(checklistItem),
  paidExpenses: many(expense, { relationName: "paidBy" }),
  createdExpenses: many(expense, { relationName: "createdBy" }),
}));

export const tripDayRelations = relations(tripDay, ({ many }) => ({
  alerts: many(dayAlert),
  items: many(itineraryItem),
}));

export const dayAlertRelations = relations(dayAlert, ({ one }) => ({
  day: one(tripDay, { fields: [dayAlert.date], references: [tripDay.date] }),
}));

export const itineraryItemRelations = relations(itineraryItem, ({ one, many }) => ({
  day: one(tripDay, { fields: [itineraryItem.date], references: [tripDay.date] }),
  expenses: many(expense),
}));

export const checklistGroupRelations = relations(checklistGroup, ({ many }) => ({
  items: many(checklistItem),
}));

export const checklistItemRelations = relations(checklistItem, ({ one }) => ({
  group: one(checklistGroup, { fields: [checklistItem.groupId], references: [checklistGroup.id] }),
  checkedBy: one(user, { fields: [checklistItem.checkedById], references: [user.id] }),
}));

export const budgetItemRelations = relations(budgetItem, ({ many }) => ({
  expenses: many(expense),
}));

export const expenseRelations = relations(expense, ({ one }) => ({
  paidBy: one(user, { fields: [expense.paidById], references: [user.id], relationName: "paidBy" }),
  createdBy: one(user, { fields: [expense.createdById], references: [user.id], relationName: "createdBy" }),
  budgetItem: one(budgetItem, { fields: [expense.budgetItemId], references: [budgetItem.id] }),
  itineraryItem: one(itineraryItem, { fields: [expense.itineraryItemId], references: [itineraryItem.id] }),
}));

export type TripDay = typeof tripDay.$inferSelect;
export type DayAlert = typeof dayAlert.$inferSelect;
export type ItineraryItem = typeof itineraryItem.$inferSelect;
export type Booking = typeof booking.$inferSelect;
