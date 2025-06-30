'use client';

import { useState } from 'react';
import { FileText, Edit2, Clock, Highlighter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/new-button';
import { cn } from '@/lib/shared/utils/cn';
import type { Note } from './types';

interface NotesHighlightsProps {
  notes: Note[];
  onNoteCreate: (note: Partial<Note>) => void;
  onNoteEdit?: (noteId: string, content: string) => void;
  onOpenFullEditor?: () => void;
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

interface NoteCardProps {
  note: Note;
  onEdit?: (content: string) => void;
}

function NoteCard({ note, onEdit }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== note.content) {
      onEdit?.(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(note.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group rounded-lg border bg-white p-3 transition-all',
        note.isHighlighted
          ? 'border-amber-200 bg-amber-50/30'
          : 'border-slate-200 hover:border-slate-300',
      )}
    >
      {/* Note header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-grow">
          <p className="text-xs font-medium text-slate-700">{note.lessonTitle}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            {note.timestamp !== undefined && (
              <>
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(note.timestamp)}</span>
                <span className="text-slate-300">•</span>
              </>
            )}
            <span>{formatDate(note.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {note.isHighlighted && (
            <div className="rounded-md bg-amber-100 p-1 text-amber-600">
              <Highlighter className="h-3.5 w-3.5" />
            </div>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md p-1 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
            aria-label="Edit note"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Note content */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            className="w-full resize-none rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
      )}
    </div>
  );
}

export function NotesHighlights({
  notes,
  onNoteCreate,
  onNoteEdit,
  onOpenFullEditor,
}: NotesHighlightsProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const recentNotes = notes.slice(0, 5);
  const highlightedCount = notes.filter(n => n.isHighlighted).length;

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onNoteCreate({ content: newNoteContent });
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase text-slate-500">Notes & Highlights</h3>
        <div className="flex items-center gap-3">
          {highlightedCount > 0 && (
            <span className="flex items-center gap-1 text-sm text-amber-600">
              <Highlighter className="h-3.5 w-3.5" />
              {highlightedCount}
            </span>
          )}
          {notes.length > 5 && <span className="text-sm text-slate-600">{notes.length} total</span>}
        </div>
      </div>

      {/* Quick add note */}
      {isAddingNote ? (
        <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/30 p-3">
          <textarea
            value={newNoteContent}
            onChange={e => setNewNoteContent(e.target.value)}
            placeholder="Type your note here..."
            className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent('');
              }}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Note
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingNote(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 py-3 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:bg-slate-100/50"
        >
          <Plus className="h-4 w-4" />
          Quick Note
        </button>
      )}

      {/* Notes list */}
      {recentNotes.length > 0 ? (
        <>
          <div className="space-y-2">
            {recentNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={content => onNoteEdit?.(note.id, content)}
              />
            ))}
          </div>

          {/* Open full editor button */}
          <Button
            type="outline"
            size="small"
            block
            onClick={onOpenFullEditor}
            icon={<FileText className="h-4 w-4" />}
            className="border-slate-200"
          >
            {notes.length > 5 ? `View All ${notes.length} Notes` : 'Open Notes Editor'}
          </Button>
        </>
      ) : (
        !isAddingNote && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">No notes yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Take notes while learning to remember key concepts
            </p>
          </div>
        )
      )}
    </div>
  );
}
