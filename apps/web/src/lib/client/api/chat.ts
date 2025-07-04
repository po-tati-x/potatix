import React, { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import type { ChatMessage } from '@/lib/shared/types/chat';

export function useChatWithLesson(
  lessonId: string,
  lessonTitle: string,
  courseId: string,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading) return;
      if (!input.trim()) return;

      const userMessage: ChatMessage = {
        id: uuid(),
        role: 'user',
        content: input.trim(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      try {
        const resp = await fetch('/api/chat/lesson', {
          method: 'POST',
          body: JSON.stringify({
            lessonId,
            courseId,
            lessonTitle,
            messages: [...messages, userMessage],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!resp.ok || !resp.body) {
          const errorText = await resp.text();
          throw new Error(errorText || 'Failed to get response');
        }

        const reader = resp.body.getReader();
        let assistantMsg: ChatMessage = {
          id: uuid(),
          role: 'assistant',
          content: '',
        };

        setMessages((prev) => [...prev, assistantMsg]);

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantMsg = { ...assistantMsg, content: assistantMsg.content + chunk };
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = assistantMsg;
            return copy;
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to get response';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [input, lessonId, courseId, lessonTitle, messages, isLoading],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    clearChat,
  } as const;
} 