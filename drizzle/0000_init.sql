CREATE TYPE "public"."BookingKind" AS ENUM('flight', 'stay', 'activity');--> statement-breakpoint
CREATE TYPE "public"."BookingNeed" AS ENUM('none', 'required', 'done');--> statement-breakpoint
CREATE TYPE "public"."BudgetStatus" AS ENUM('paid', 'estimated');--> statement-breakpoint
CREATE TYPE "public"."Category" AS ENUM('air', 'stay', 'food', 'tour', 'transport', 'shopping', 'etc');--> statement-breakpoint
CREATE TYPE "public"."City" AS ENUM('paris', 'porto', 'barcelona');--> statement-breakpoint
CREATE TYPE "public"."Currency" AS ENUM('EUR', 'KRW');--> statement-breakpoint
CREATE TYPE "public"."ItemKind" AS ENUM('activity', 'meal', 'flight', 'transfer', 'rest');--> statement-breakpoint
CREATE TYPE "public"."PayMethod" AS ENUM('card', 'cash');--> statement-breakpoint
CREATE TYPE "public"."TaxFreeStatus" AS ENUM('form', 'validated', 'refunded');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "BookingKind" NOT NULL,
	"title" text NOT NULL,
	"ref_code" text,
	"starts_at" text NOT NULL,
	"ends_at" text,
	"address" text,
	"phone" text,
	"detail" text
);
--> statement-breakpoint
CREATE TABLE "budget_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "Category" NOT NULL,
	"title" text NOT NULL,
	"status" "BudgetStatus" NOT NULL,
	"currency" "Currency" NOT NULL,
	"amount_minor" integer NOT NULL,
	"note" text,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"urgent" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checklist_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"title" text NOT NULL,
	"detail" text,
	"due_at" timestamp with time zone,
	"checked_by" integer,
	"checked_at" timestamp with time zone,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_alert" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text,
	"title" text NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" serial PRIMARY KEY NOT NULL,
	"spent_on" text NOT NULL,
	"city" "City" NOT NULL,
	"category" "Category" NOT NULL,
	"title" text NOT NULL,
	"currency" "Currency" NOT NULL,
	"amount_minor" integer NOT NULL,
	"fx_rate" double precision NOT NULL,
	"amount_krw" integer NOT NULL,
	"method" "PayMethod" NOT NULL,
	"paid_by" integer NOT NULL,
	"budget_item_id" integer,
	"itinerary_item_id" integer,
	"tax_free_minor" integer,
	"tax_free_status" "TaxFreeStatus",
	"memo" text,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"kind" "ItemKind" NOT NULL,
	"booking" "BookingNeed" DEFAULT 'none' NOT NULL,
	"is_key" boolean DEFAULT false NOT NULL,
	"map_query" text,
	"sort_order" integer NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_day" (
	"date" text PRIMARY KEY NOT NULL,
	"city" "City" NOT NULL,
	"tz" text NOT NULL,
	"title" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_group_id_checklist_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."checklist_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_checked_by_app_user_id_fk" FOREIGN KEY ("checked_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_alert" ADD CONSTRAINT "day_alert_date_trip_day_date_fk" FOREIGN KEY ("date") REFERENCES "public"."trip_day"("date") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_paid_by_app_user_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_budget_item_id_budget_item_id_fk" FOREIGN KEY ("budget_item_id") REFERENCES "public"."budget_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_itinerary_item_id_itinerary_item_id_fk" FOREIGN KEY ("itinerary_item_id") REFERENCES "public"."itinerary_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_date_trip_day_date_fk" FOREIGN KEY ("date") REFERENCES "public"."trip_day"("date") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_spent_on_idx" ON "expense" USING btree ("spent_on");--> statement-breakpoint
CREATE INDEX "expense_category_idx" ON "expense" USING btree ("category");--> statement-breakpoint
CREATE INDEX "itinerary_item_date_sort_order_idx" ON "itinerary_item" USING btree ("date","sort_order");