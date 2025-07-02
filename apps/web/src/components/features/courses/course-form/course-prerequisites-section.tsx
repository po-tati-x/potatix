import { StringListSection } from "./course-string-list-section";

interface CoursePrerequisitesSectionProps {
  courseId: string;
  prerequisites: string[];
}

export function CoursePrerequisitesSection({ courseId, prerequisites }: CoursePrerequisitesSectionProps) {
  return (
    <StringListSection
      courseId={courseId}
      items={prerequisites}
      field="prerequisites"
      heading="Prerequisites"
    />
  );
} 