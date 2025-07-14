import { Send } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/new-button";

export interface ChatInputProps {
  input: string;
  inputRows: number;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export const ChatInput = ({
  input,
  inputRows,
  handleInputChange,
  handleKeyDown,
  handleSubmit,
  isLoading,
  inputRef,
}: ChatInputProps) => {
  // Auto-focus on mount while respecting a11y (no attribute needed)
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [inputRef]);

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
      <div className="bg-slate-50 rounded-md border border-slate-200 focus-within:border-emerald-300 focus-within:ring-1 focus-within:ring-emerald-100 overflow-hidden">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI (⌘+Enter to send)"
          className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none"
          rows={inputRows}
        />

        <div className="flex items-center justify-between p-2 pt-0">
          <div className="text-xs text-slate-400">Shift+Enter for new line</div>

          <Button
            type="primary"
            size="small"
            disabled={!input.trim() || isLoading}
            iconRight={<Send className="h-3 w-3" />}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </form>
  );
};
