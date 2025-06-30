'use client';

import { MessageSquare, Pin, Users } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/new-button';
import { cn } from '@/lib/shared/utils/cn';
import type { DiscussionThread } from './types';

interface DiscussionSnapshotProps {
  discussions: DiscussionThread[];
  onThreadClick?: (threadId: string) => void;
  onAskCommunity?: () => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

interface ThreadItemProps {
  thread: DiscussionThread;
  onClick?: () => void;
}

function ThreadItem({ thread, onClick }: ThreadItemProps) {
  // Get the first letter of the author's name or use a fallback
  const authorInitial = thread.lastReplyAuthor.name.charAt(0).toUpperCase() || '?';
  
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-slate-300"
    >
      {/* Thread indicator */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            thread.isUnread ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500',
          )}
        >
          <MessageSquare className="h-4 w-4" />
        </div>
        {thread.isPinned && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-white">
            <Pin className="h-2.5 w-2.5" />
          </div>
        )}
        {thread.isUnread && (
          <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500" />
        )}
      </div>

      {/* Thread content */}
      <div className="flex-grow overflow-hidden">
        <h4 className="line-clamp-1 font-medium text-slate-900 group-hover:text-emerald-600">
          {thread.title}
        </h4>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
          </span>
          <span className="text-slate-300">•</span>
          <span>{formatTimeAgo(thread.lastReplyAt)}</span>
        </div>
      </div>

      {/* Last replier avatar */}
      {thread.lastReplyAuthor.avatar ? (
        <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border border-slate-200">
          <Image
            src={thread.lastReplyAuthor.avatar}
            alt={thread.lastReplyAuthor.name}
            fill
            className="object-cover"
            sizes="24px"
          />
        </div>
      ) : (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
          {authorInitial}
        </div>
      )}
    </button>
  );
}

export function DiscussionSnapshot({
  discussions,
  onThreadClick,
  onAskCommunity,
}: DiscussionSnapshotProps) {
  const activeThreads = discussions.slice(0, 3);
  const unreadCount = discussions.filter(d => d.isUnread).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase text-slate-500">Community Discussion</h3>
        {unreadCount > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {unreadCount} new
          </span>
        )}
      </div>

      {activeThreads.length > 0 ? (
        <div className="space-y-2">
          {activeThreads.map(thread => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              onClick={() => onThreadClick?.(thread.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">No discussions yet</p>
          <p className="mt-1 text-xs text-slate-500">Be the first to start a conversation</p>
        </div>
      )}

      {/* Ask community CTA */}
      <Button
        type="outline"
        size="small"
        block
        onClick={onAskCommunity}
        icon={<MessageSquare className="h-4 w-4" />}
        className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      >
        Ask the Community
      </Button>
    </div>
  );
}
