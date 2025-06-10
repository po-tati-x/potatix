ALTER TABLE "course" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_slug_unique" UNIQUE("slug");