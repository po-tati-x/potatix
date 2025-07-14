'use client';

import { Calendar, Video, Users, Clock, ExternalLink, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/shared/utils/cn';
import type { UpcomingEvent } from './types';

interface UpcomingEventsProps {
  events: UpcomingEvent[];
  onAddToCalendar?: (event: UpcomingEvent) => void;
  onWatchRecording?: (recordingUrl: string) => void;
}

const eventTypeConfig = {
  live: {
    label: 'Live Session',
    icon: Video,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  qa: {
    label: 'Q&A',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  workshop: {
    label: 'Workshop',
    icon: Users,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
};

function formatEventTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  if (isToday)
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (isTomorrow)
    return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isEventPast(event: UpcomingEvent): boolean {
  return new Date(event.startTime).getTime() + event.duration * 60 * 1000 < Date.now();
}

interface EventCardProps {
  event: UpcomingEvent;
  onAddToCalendar?: () => void;
  onWatchRecording?: () => void;
}

function EventCard({ event, onAddToCalendar, onWatchRecording }: EventCardProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;
  const isPast = isEventPast(event);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-white transition-all',
        isPast ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-slate-300',
      )}
    >
      <div className="p-4">
        {/* Event header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn('rounded-lg border p-2', config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900">{event.title}</h4>
              <p className="mt-0.5 text-xs text-slate-500">{config.label}</p>
            </div>
          </div>
          {!isPast && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Upcoming
            </span>
          )}
        </div>

        {/* Event details */}
        <div className="mb-3 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{formatEventTime(new Date(event.startTime))}</span>
            <span className="text-slate-400">•</span>
            <span>{event.duration} min</span>
          </div>

          <div className="flex items-center gap-2">
            {event.instructorAvatar ? (
              <div className="relative h-5 w-5 overflow-hidden rounded-full border border-slate-200">
                <Image
                  src={event.instructorAvatar}
                  alt={event.instructorName}
                  fill
                  className="object-cover"
                  sizes="20px"
                />
              </div>
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                {event.instructorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs">{event.instructorName}</span>
            {event.attendeeCount && !isPast && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-xs">{event.attendeeCount} attending</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isPast && event.recordingUrl ? (
            <button
              onClick={() => onWatchRecording?.()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100"
            >
              <PlayCircle className="h-4 w-4" />
              Watch Recording
            </button>
          ) : (isPast ? (
            <div className="flex-1 rounded-md bg-slate-50 px-3 py-1.5 text-center text-sm text-slate-500">
              Recording not available
            </div>
          ) : (
            <>
              <a
                href={event.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => {
                  e.preventDefault();
                  onAddToCalendar?.();
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100"
              >
                <Calendar className="h-4 w-4" />
                Add to Calendar
              </a>
              <a
                href={event.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open event details"
                className="flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UpcomingEvents({ events, onAddToCalendar, onWatchRecording }: UpcomingEventsProps) {
  const upcomingEvents = events.filter(e => !isEventPast(e));
  const pastEvents = events.filter(e => isEventPast(e) && e.recordingUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase text-slate-500">Live Events</h3>
        {upcomingEvents.length > 0 && (
          <span className="text-sm text-slate-600">{upcomingEvents.length} upcoming</span>
        )}
      </div>

      {events.length > 0 ? (
        <div className="space-y-3">
          {/* Upcoming events */}
          {upcomingEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onAddToCalendar={() => onAddToCalendar?.(event)}
            />
          ))}

          {/* Past events with recordings */}
          {pastEvents.length > 0 && upcomingEvents.length > 0 && (
            <div className="text-xs font-medium text-slate-500">Past recordings</div>
          )}
          {pastEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onWatchRecording={() => onWatchRecording?.(event.recordingUrl!)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
          <Calendar className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">No events scheduled</p>
          <p className="mt-1 text-xs text-slate-500">Check back later for live sessions</p>
        </div>
      )}
    </div>
  );
}
