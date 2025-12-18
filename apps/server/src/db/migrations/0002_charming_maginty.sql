ALTER TABLE "post" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "vote" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "is_approved" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "view_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "view_count" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "thread_title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "thread" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "topic_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "topic_description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "image_url" varchar(500);