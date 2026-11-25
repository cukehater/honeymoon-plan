-- 단일 운영자 전환: 체크 여부는 checked_at만으로 판단한다. checked_by만 있던 행도 체크 상태를 유지한다.
UPDATE "checklist_item" SET "checked_at" = now() WHERE "checked_by" IS NOT NULL AND "checked_at" IS NULL;--> statement-breakpoint
ALTER TABLE "checklist_item" DROP CONSTRAINT "checklist_item_checked_by_app_user_id_fk";--> statement-breakpoint
ALTER TABLE "expense" DROP CONSTRAINT "expense_paid_by_app_user_id_fk";--> statement-breakpoint
ALTER TABLE "expense" DROP CONSTRAINT "expense_created_by_app_user_id_fk";--> statement-breakpoint
ALTER TABLE "checklist_item" DROP COLUMN "checked_by";--> statement-breakpoint
ALTER TABLE "expense" DROP COLUMN "paid_by";--> statement-breakpoint
ALTER TABLE "expense" DROP COLUMN "created_by";--> statement-breakpoint
DROP TABLE "app_user";
