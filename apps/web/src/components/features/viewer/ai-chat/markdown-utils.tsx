import { Play } from 'lucide-react';
import type { ReactNode } from 'react';

// Define types for Markdown component props
interface MarkdownComponentProps {
  children?: ReactNode;
  className?: string;
}

interface CodeProps extends MarkdownComponentProps {
  inline?: boolean;
}

/**
 * Create a timestamp button from a timestamp string
 */
const createTimestampButton = (
  part: string, 
  key: number,
  handleJumpToTimestamp: (timeStr: string) => void
) => (
  <button 
    key={key}
    onClick={() => handleJumpToTimestamp(part)}
    className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold hover:text-emerald-800 hover:underline"
  >
    <Play className="h-3 w-3" /> {part}
  </button>
);

/**
 * Split text by timestamps and render components
 */
const renderWithTimestamps = (
  text: string, 
  handleJumpToTimestamp: (timeStr: string) => void,
  ElementWrapper: React.ElementType,
  className?: string
) => {
  const parts = text.split(/(\[\d+:\d+\])/g);
  
  return (
    <ElementWrapper className={className}>
      {parts.map((part: string, i: number) => {
        if (part.match(/^\[\d+:\d+\]$/)) {
          return createTimestampButton(part, i, handleJumpToTimestamp);
        }
        return <span key={i}>{part}</span>;
      })}
    </ElementWrapper>
  );
};

/**
 * Create markdown components with timestamp handling
 */
export function createMarkdownComponents(handleJumpToTimestamp: (timeStr: string) => void) {
  return {
    // Add custom styling for timestamps [00:00] and make them clickable
    p: ({ children, ...props }: MarkdownComponentProps) => {
      const text = children?.toString() || '';
      
      // Check if the paragraph contains timestamps
      if (text.match(/\[\d+:\d+\]/)) {
        return renderWithTimestamps(text, handleJumpToTimestamp, 'p', 'mb-2');
      }
      
      return <p {...props} className="mb-2">{children}</p>;
    },
    
    // Custom styling for headings
    h1: ({ children, ...props }: MarkdownComponentProps) => (
      <h3 {...props} className="text-lg font-semibold text-slate-800 mt-3 mb-2">{children}</h3>
    ),
    h2: ({ children, ...props }: MarkdownComponentProps) => (
      <h3 {...props} className="text-md font-semibold text-slate-800 mt-2 mb-1.5">{children}</h3>
    ),
    h3: ({ children, ...props }: MarkdownComponentProps) => (
      <h3 {...props} className="font-medium text-slate-800 mt-2 mb-1">{children}</h3>
    ),
    
    // Custom styling for lists
    ul: ({ children, ...props }: MarkdownComponentProps) => (
      <ul {...props} className="list-disc pl-5 my-2">{children}</ul>
    ),
    ol: ({ children, ...props }: MarkdownComponentProps) => (
      <ol {...props} className="list-decimal pl-5 my-2">{children}</ol>
    ),
    li: ({ children, ...props }: MarkdownComponentProps) => {
      const text = children?.toString() || '';
      
      // Check if list item contains timestamps
      if (text.match(/\[\d+:\d+\]/)) {
        return renderWithTimestamps(text, handleJumpToTimestamp, 'li', 'mb-1');
      }
      
      return <li {...props} className="mb-1">{children}</li>;
    },
    
    // Custom styling for code
    code: ({ inline, children, ...props }: CodeProps) => (
      inline ? 
        <code {...props} className="bg-slate-100 text-slate-800 px-1 rounded text-xs">{children}</code> :
        <code {...props} className="block bg-slate-100 text-slate-800 p-2 rounded text-xs overflow-x-auto my-2">{children}</code>
    ),

    // Custom styling for strong/bold text, preserves bold but makes timestamps clickable
    strong: ({ children, ...props }: MarkdownComponentProps) => {
      const text = children?.toString() || '';
      if (text.match(/\[\d+:\d+\]/)) {
        return renderWithTimestamps(text, handleJumpToTimestamp, 'strong', 'font-semibold');
      }
      return <strong {...props} className="font-semibold">{children}</strong>;
    },
    
    // Custom styling for em/italic text
    em: ({ children, ...props }: MarkdownComponentProps) => {
      const text = children?.toString() || '';

      // Phase/Step highlighting
      if (text.match(/^(Phase|Step|Section) \d+:/i)) {
        return <em {...props} className="block font-semibold text-emerald-700 mt-2 mb-1 not-italic">{children}</em>;
      }

      // Make timestamps inside italics clickable as well
      if (text.match(/\[\d+:\d+\]/)) {
        return renderWithTimestamps(text, handleJumpToTimestamp, 'em');
      }

      return <em {...props}>{children}</em>;
    },
  };
} 