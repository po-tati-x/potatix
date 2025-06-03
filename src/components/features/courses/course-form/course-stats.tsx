interface CourseStatsProps {
  moduleCount: number;
  lessonCount: number;
  status: 'draft' | 'published' | 'archived';
  price: number;
}

export function CourseStats({
  moduleCount,
  lessonCount, 
  status,
  price,
}: CourseStatsProps) {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">Course Stats</h2>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Modules</span>
          <span className="text-sm font-medium text-slate-900">
            {moduleCount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Lessons</span>
          <span className="text-sm font-medium text-slate-900">
            {lessonCount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Status</span>
          <span className="text-xs font-medium capitalize text-slate-900">
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Price</span>
          <span className="text-sm font-medium text-slate-900">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
} 