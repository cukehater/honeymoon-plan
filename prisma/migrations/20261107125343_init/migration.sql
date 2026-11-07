-- CreateTable
CREATE TABLE "app_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "trip_day" (
    "date" TEXT NOT NULL PRIMARY KEY,
    "city" TEXT NOT NULL,
    "tz" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT
);

-- CreateTable
CREATE TABLE "day_alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    CONSTRAINT "day_alert_date_fkey" FOREIGN KEY ("date") REFERENCES "trip_day" ("date") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "itinerary_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL,
    "booking" TEXT NOT NULL DEFAULT 'none',
    "is_key" BOOLEAN NOT NULL DEFAULT false,
    "map_query" TEXT,
    "sort_order" INTEGER NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "itinerary_item_date_fkey" FOREIGN KEY ("date") REFERENCES "trip_day" ("date") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checklist_group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "checklist_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "due_at" DATETIME,
    "checked_by" INTEGER,
    "checked_at" DATETIME,
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "checklist_item_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "checklist_group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "checklist_item_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "app_user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ref_code" TEXT,
    "starts_at" TEXT NOT NULL,
    "ends_at" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "detail" TEXT
);

-- CreateTable
CREATE TABLE "budget_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "note" TEXT,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "spent_on" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "fx_rate" REAL NOT NULL,
    "amount_krw" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "paid_by" INTEGER NOT NULL,
    "budget_item_id" INTEGER,
    "itinerary_item_id" INTEGER,
    "tax_free_minor" INTEGER,
    "tax_free_status" TEXT,
    "memo" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "expense_paid_by_fkey" FOREIGN KEY ("paid_by") REFERENCES "app_user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expense_budget_item_id_fkey" FOREIGN KEY ("budget_item_id") REFERENCES "budget_item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "expense_itinerary_item_id_fkey" FOREIGN KEY ("itinerary_item_id") REFERENCES "itinerary_item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "expense_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "itinerary_item_date_sort_order_idx" ON "itinerary_item"("date", "sort_order");

-- CreateIndex
CREATE INDEX "expense_spent_on_idx" ON "expense"("spent_on");

-- CreateIndex
CREATE INDEX "expense_category_idx" ON "expense"("category");
