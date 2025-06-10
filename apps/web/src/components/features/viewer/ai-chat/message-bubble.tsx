import { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Message } from 'ai';
import { useTimestampNavigation } from './hooks';
import { createMarkdownComponents } from './markdown-utils';

interface MessageProps {
  message: Message;
  lessonId: string;
  onCopy: () => void;
}

export const MessageBubble = ({ message, lessonId, onCopy }: MessageProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const { handleJumpToTimestamp } = useTimestampNavigation(lessonId);
  
  const handleCopyMessage = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const MarkdownComponents = createMarkdownComponents(handleJumpToTimestamp);

  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`max-w-[85%] rounded-lg p-3 ${
        isUser ? 'bg-emerald-500 text-white' : 'bg-white shadow-sm border border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className={`flex items-center text-xs ${isUser ? 'text-emerald-50' : 'text-slate-500'}`}>
            {isUser ? (
              <>
                <User className="h-3 w-3 mr-1" />
                <span>You</span>
              </>
            ) : (
              <>
                <Bot className="h-3 w-3 mr-1" />
                <span>AI Assistant</span>
              </>
            )}
          </div>
          
          {!isUser && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleCopyMessage}
                className="text-slate-400 hover:text-slate-600 ml-2 p-0.5 rounded"
                title="Copy response"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          )}
        </div>
        
        {isUser ? (
          <div className="text-sm whitespace-pre-line">{message.content}</div>
        ) : (
          <div className="text-sm ai-chat-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              components={MarkdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 