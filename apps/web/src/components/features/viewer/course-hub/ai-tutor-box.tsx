'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/shared/utils/cn';

interface AITutorBoxProps {
  onAskAI: (prompt: string) => void;
  isStreaming?: boolean;
  streamingResponse?: string;
}

export function AITutorBox({
  onAskAI,
  isStreaming = false,
  streamingResponse = '',
}: AITutorBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (streamingResponse && responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamingResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;

    onAskAI(prompt);
    setRecentQuestions(prev => [prompt, ...prev.slice(0, 2)]);
    setPrompt('');
    setIsExpanded(true);
  };

  const handleQuickQuestion = (question: string) => {
    setPrompt(question);
    inputRef.current?.focus();
  };

  const suggestedQuestions = [
    'Explain this concept in simple terms',
    'Give me a practical example',
    'What are common mistakes here?',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase text-slate-500">AI Tutor</h3>
        <div className="flex items-center gap-1.5 text-xs text-purple-600">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by AI</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {/* Input section */}
        <form onSubmit={handleSubmit} className="relative border-b border-slate-100">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask about this course..."
            className="w-full bg-transparent px-4 py-3 pr-12 text-sm placeholder-slate-400 focus:outline-none"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isStreaming}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-all',
              prompt.trim() && !isStreaming
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-slate-100 text-slate-400',
            )}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        {/* Response area */}
        {(streamingResponse || isExpanded) && (
          <div
            ref={responseRef}
            className={cn(
              'max-h-64 overflow-y-auto p-4 text-sm',
              streamingResponse ? 'bg-purple-50/30' : 'bg-slate-50/50',
            )}
          >
            {streamingResponse ? (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-700">{streamingResponse}</div>
                {isStreaming && (
                  <span className="inline-block h-4 w-1 animate-pulse bg-purple-600" />
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                <p className="text-xs">Ask me anything about this course!</p>
              </div>
            )}
          </div>
        )}

        {/* Suggested questions */}
        {!streamingResponse && !isExpanded && (
          <div className="p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-100"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent questions */}
        {recentQuestions.length > 0 && !streamingResponse && (
          <div className="border-t border-slate-100 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">Recent:</p>
            <div className="space-y-1">
              {recentQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="block w-full truncate rounded-md px-2 py-1 text-left text-xs text-slate-600 transition-all hover:bg-slate-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
