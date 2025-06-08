'use client';

import { memo, useRef, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useChatWithLesson } from '@/lib/api/chat';

// Import custom hooks
import { useMessageInteractions, useInputResizing } from './hooks';

// Import UI components
import { MessageBubble } from './message-bubble';
import { EmptyState } from './empty-state';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { LoadingIndicator, ErrorMessage } from './status-indicators';

interface AIChatPanelProps {
  lessonId: string;
  courseId: string;
  lessonTitle: string;
}

/**
 * Main chat panel component
 */
function AIChatPanel({ lessonId, courseId, lessonTitle }: AIChatPanelProps) {
  // Use our custom hooks
  const { 
    messages, 
    input, 
    setInput,
    handleInputChange, 
    handleSubmit, 
    isLoading,
    error,
    clearChat
  } = useChatWithLesson(lessonId, lessonTitle, courseId);
  
  const { isCopied, handleCopy } = useMessageInteractions();
  const { inputRows } = useInputResizing(input);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>;
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Setup hotkeys for improved UX
  useHotkeys('meta+enter, ctrl+enter', (e: KeyboardEvent) => {
    if (input.trim()) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }, { enableOnFormTags: true }, [input, handleSubmit]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);
  
  const focusInput = () => inputRef.current?.focus();
  
  // Handle keydown events in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Show confirmation before clearing chat
  const handleClearChat = () => {
    if (messages.length > 0 && confirm('Are you sure you want to clear this conversation?')) {
      clearChat();
    }
  };
  
  return (
    <div className="flex flex-col h-full border-l border-slate-200 bg-white">
      {/* Header */}
      <ChatHeader 
        messageCount={messages.length}
        isCopied={isCopied}
        onClearChat={handleClearChat}
      />
      
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 bg-slate-50"
      >
        {messages.length === 0 ? (
          <EmptyState setInput={setInput} focusInput={focusInput} />
        ) : (
          <>
            {messages.map(message => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                lessonId={lessonId}
                onCopy={handleCopy} 
              />
            ))}
          </>
        )}
        
        {isLoading && <LoadingIndicator />}
        
        {error && <ErrorMessage error={error} />}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <ChatInput 
        input={input}
        inputRows={inputRows}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
}

export default memo(AIChatPanel); 