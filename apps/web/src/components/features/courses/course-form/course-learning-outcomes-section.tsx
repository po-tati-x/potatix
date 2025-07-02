import { StringListSection } from "./course-string-list-section";

interface CourseLearningOutcomesSectionProps {
  courseId: string;
  outcomes: string[];
}

export function CourseLearningOutcomesSection({ courseId, outcomes }: CourseLearningOutcomesSectionProps) {
  return (
    <StringListSection
      courseId={courseId}
      items={outcomes}
      field="learningOutcomes"
      heading="What you'll learn"
    />
  );
} 