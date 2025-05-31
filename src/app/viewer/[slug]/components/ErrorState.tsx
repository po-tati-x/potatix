'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  message: string;
  buttonText: string;
  buttonAction: () => void;
}

export default function ErrorState({ 
  title, 
  message, 
  buttonText, 
  buttonAction 
}: ErrorStateProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="max-w-md text-center p-8">
        {/* Error illustration */}
        <div className="relative h-32 w-32 mx-auto mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 bg-red-100 rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        
        {/* Error content */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3">{title}</h1>
        <p className="text-slate-600 mb-8">{message}</p>
        
        {/* Action button */}
        <button 
          onClick={buttonAction} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
} 