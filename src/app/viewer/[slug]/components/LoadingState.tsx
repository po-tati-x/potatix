'use client';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="text-center p-8 max-w-md">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-white"></div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">{message}</h3>
        <p className="text-sm text-slate-500">
          This may take a few moments. Please wait...
        </p>
      </div>
    </div>
  );
} 