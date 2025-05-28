interface CourseHeaderProps {
  title: string;
  totalLessons: number;
}

export function CourseHeader({ title, totalLessons }: CourseHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="text-neutral-600 mt-1">{totalLessons} lessons available</p>
          </div>
        </div>
      </div>
    </header>
  );
}