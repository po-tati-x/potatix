'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, UserCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/shared/utils/cn';
import { HelpButton, ReferButton } from '../utility';
import { useProfile } from '@/lib/client/hooks/use-profile';
import { useNavigationArea } from '../hooks';
import { useContext } from 'react';
import { SideNavContext } from '../context';

// Preserve public API so callers remain unchanged ---------------------------
interface SidebarHeaderBaseProps {
  className?: string;
}

interface LogoHeader extends SidebarHeaderBaseProps {
  variant: 'logo';
}

interface BackHeader extends SidebarHeaderBaseProps {
  variant: 'back';
  title: string;
  backHref?: string;
  onBack?: () => void;
}

interface CourseHeader extends SidebarHeaderBaseProps {
  variant: 'course';
  title: string;
}

type SidebarHeaderProps = LogoHeader | BackHeader | CourseHeader;

// Small internal component extracted to eliminate dupe ----------------------
function ModeSwitch({
  resolvedArea,
  setOverrideArea,
}: {
  resolvedArea: 'default' | 'course';
  setOverrideArea: (v: 'default' | null) => void;
}) {
  return (
    <div className="ml-1 flex rounded-md bg-slate-200 p-0.5">
      <button
        type="button"
        onClick={() => setOverrideArea('default')}
        className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-md transition-colors',
          resolvedArea === 'default'
            ? 'bg-white text-emerald-700 shadow'
            : 'text-slate-700 hover:bg-slate-300',
        )}
      >
        App
      </button>
      <button
        type="button"
        onClick={() => setOverrideArea(null)}
        className={cn(
          'px-2 py-0.5 text-xs font-medium rounded-md transition-colors',
          resolvedArea === 'course'
            ? 'bg-white text-emerald-700 shadow'
            : 'text-slate-700 hover:bg-slate-300',
        )}
      >
        Course
      </button>
    </div>
  );
}

export function SidebarHeader(props: SidebarHeaderProps) {
  const { profile } = useProfile();
  const area = useNavigationArea();
  const { overrideArea, setOverrideArea } = useContext(SideNavContext);
  const resolvedArea: 'default' | 'course' = (overrideArea ?? area) as any;
  const { className } = props;

  // ---------------- Left-side content -------------------------------------
  let leftContent: ReactNode;

  switch (props.variant) {
    case 'logo':
      leftContent = (
        <Link
          href="/"
          className="flex h-8 items-center rounded-md px-1 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black/50"
        >
          <Image
            src="https://storage.potatix.com/potatix/images/potatix-isolated.svg"
            alt="Potatix"
            width={87.2}
            height={15.2}
            className="h-6 w-auto"
            priority
          />
        </Link>
      );
      break;

    case 'course':
      leftContent = (
        <span className="text-sm font-semibold text-slate-800 truncate max-w-[8rem]">
          {props.title}
        </span>
      );
      break;

    case 'back':
      if (props.onBack) {
        leftContent = (
          <button
            type="button"
            onClick={props.onBack}
            className="group flex h-8 items-center gap-1.5 rounded-md px-1 text-sm font-medium text-slate-800 outline-none transition-colors hover:bg-slate-200/50 active:bg-slate-200/80 focus-visible:ring-2 focus-visible:ring-black/50"
          >
            <ChevronLeft className="size-4 text-slate-600 transition-transform duration-100 group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
        );
      } else {
        leftContent = (
          <Link
            href={props.backHref ?? '/'}
            className="group flex h-8 items-center gap-2 rounded-md px-1 text-sm font-medium text-slate-800 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black/50"
          >
            <ChevronLeft className="size-4 text-slate-600 transition-transform duration-100 group-hover:-translate-x-0.5" />
            {props.title}
          </Link>
        );
      }
      break;

    default:
      leftContent = null;
  }

  return (
    <div className={cn('relative flex items-center justify-between gap-1 pb-3', className)}>
      <div className="flex items-center gap-2">
        {leftContent}
        {area === 'course' && (
          <ModeSwitch resolvedArea={resolvedArea} setOverrideArea={setOverrideArea} />
        )}
      </div>

      {/* Right-side utility buttons */}
      <div className="flex h-8 items-center gap-3">
        <HelpButton />
        <ReferButton />
        <Link
          href="/settings"
          className="group block h-8 w-8 overflow-hidden rounded-full border border-slate-200 transition-all hover:border-slate-300"
        >
          {profile?.image ? (
            <Image
              src={profile.image}
              alt="Profile"
              width={32}
              height={32}
              sizes="32px"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <UserCircle className="size-5 text-slate-400" />
            </div>
          )}
          <span className="sr-only">Your profile</span>
        </Link>
      </div>
    </div>
  );
} 