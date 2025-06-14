import { Trash2, Bot, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatHeaderProps {
  messageCount: number;
  isCopied: boolean;
  onClearChat: () => void;
  onHideChat?: () => void;
}

export const ChatHeader = ({ messageCount, isCopied, onClearChat, onHideChat }: ChatHeaderProps) => (
  <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
    <div className="flex items-center">
      <div className="bg-emerald-100 p-1 rounded-md mr-2">
        <Bot className="h-4 w-4 text-emerald-600" />
      </div>
      <div>
        <span className="font-medium text-sm text-slate-700">Lesson Assistant</span>
        {messageCount > 0 && (
          <span className="text-xs text-slate-500 ml-2">
            ({messageCount} message{messageCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    </div>
    
    <AnimatePresence>
      {isCopied && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-emerald-600 absolute right-12"
        >
          Copied!
        </motion.span>
      )}
    </AnimatePresence>
    
    <div className="flex gap-2">
      {messageCount > 0 && (
        <button
          onClick={onClearChat}
          className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
          title="Clear conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {onHideChat && (
        <button
          onClick={onHideChat}
          className="text-slate-400 hover:text-emerald-600 p-1 rounded transition-colors inline-flex"
          title="Hide chat"
          aria-label="Hide chat assistant"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
); 