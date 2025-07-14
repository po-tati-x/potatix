import { Lock, AlertTriangle, RotateCcw } from 'lucide-react';

interface VideoErrorProps {
  error: string | undefined;
  onRetry: () => void;
}

export function EmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
      <Lock className="h-8 w-8 mb-4" />
      <p>No video available.</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}

export function VideoErrorState({ error, onRetry }: VideoErrorProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
      <p className="mb-6 text-red-300">{error ?? 'Unknown error'}</p>
      <button
        className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-slate-800 hover:bg-slate-100"
        onClick={onRetry}
      >
        <RotateCcw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
} 