'use client';

import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

interface ChatPromptProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

interface EmptyStateProps {
  setInput: (value: string) => void;
  focusInput: () => void;
  lessonId: string;
  courseId: string;
  lessonTitle: string;
}

// Simple chat prompt button
const ChatPrompt = ({ prompt, onClick }: ChatPromptProps) => (
  <motion.button
    className="text-left px-3 py-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-xs"
    onClick={() => onClick(prompt)}
    whileHover={{ y: -2, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    {prompt}
  </motion.button>
);

export const EmptyState = ({ setInput, focusInput, lessonId, courseId, lessonTitle }: EmptyStateProps) => {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch AI-generated prompts once
  useEffect(() => {
    let cancelled = false;

    const promptRespSchema = z.object({ prompts: z.array(z.string()) });

    async function fetchPrompts() {
      try {
        const resp = await fetch('/api/chat/lesson/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId, courseId, lessonTitle }),
        });

        if (resp.ok) {
          const json = (await resp.json()) as unknown;
          const parsed = promptRespSchema.safeParse(json);
          if (parsed.success && !cancelled) {
            setPrompts(parsed.data.prompts);
          }
        }
      } catch (error) {
        // Network failures are non-critical; fall back to static prompts.
        console.error('Failed to fetch AI chat prompts', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Fire and forget – explicitly ignored promise
    void fetchPrompts();

    return () => {
      cancelled = true;
    };
  }, [lessonId, courseId, lessonTitle]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    focusInput();
  };

  const fallbackPrompts = [
    'Explain this lesson in simple terms',
    'Summarize the key points of this lesson',
    'What are practical applications of this?',
    'Give me code examples from this lesson',
    'What should I focus on in this lesson?',
  ];
  const displayPrompts = prompts.length > 0 ? prompts : fallbackPrompts;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 select-none">
      <motion.div 
        className="bg-slate-50 border border-slate-200 rounded-full p-4 mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Bot className="h-8 w-8 text-emerald-500" />
      </motion.div>
      
      <motion.h3 
        className="text-sm font-medium text-slate-700 mb-1"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        AI Lesson Assistant
      </motion.h3>
      
      <motion.p 
        className="text-xs text-slate-500 mb-6 text-center max-w-xs"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Ask questions about this lesson or choose from suggested prompts below
      </motion.p>
      
      <motion.div 
        className="grid grid-cols-1 gap-2 w-full max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-slate-400" /></div>
        ) : (
          displayPrompts.map((prompt) => (
            <ChatPrompt key={prompt} prompt={prompt} onClick={handlePromptClick} />
          ))
        )}
      </motion.div>
    </div>
  );
}; 