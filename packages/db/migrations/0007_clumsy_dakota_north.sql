ALTER TABLE "module" RENAME TO "course_module";--> statement-breakpoint
ALTER TABLE "lesson" DROP CONSTRAINT "lesson_moduleId_module_id_fk";
--> statement-breakpoint
ALTER TABLE "course_module" DROP CONSTRAINT "module_courseId_course_id_fk";
--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_moduleId_course_module_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."course_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_module" ADD CONSTRAINT "course_module_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;