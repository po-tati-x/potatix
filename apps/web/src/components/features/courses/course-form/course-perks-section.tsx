import { StringListSection } from "./course-string-list-section";

interface CoursePerksSectionProps {
  courseId: string;
  perks: string[];
}

export function CoursePerksSection({ courseId, perks }: CoursePerksSectionProps) {
  return (
    <StringListSection
      courseId={courseId}
      items={perks}
      field="perks"
      heading="Course Perks"
    />
  );
} 