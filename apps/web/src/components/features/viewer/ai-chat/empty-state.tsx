import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatPromptProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

interface EmptyStateProps {
  setInput: (value: string) => void;
  focusInput: () => void;
}

// Simple chat prompt button
const ChatPrompt = ({ prompt, onClick }: ChatPromptProps) => (
  <motion.button
    className="text-left px-3 py-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm text-xs"
    onClick={() => onClick(prompt)}
    whileHover={{ y: -2, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    {prompt}
  </motion.button>
);

export const EmptyState = ({ setInput, focusInput }: EmptyStateProps) => {
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    focusInput();
  };

  const prompts = [
    "Explain this lesson in simple terms",
    "Summarize the key points of this lesson",
    "What are practical applications of this?",
    "Give me code examples from this lesson",
    "What should I focus on in this lesson?"
  ];

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
        {prompts.map((prompt) => (
          <ChatPrompt 
            key={prompt} 
            prompt={prompt} 
            onClick={handlePromptClick}
          />
        ))}
      </motion.div>
    </div>
  );
}; 