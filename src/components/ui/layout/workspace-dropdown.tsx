"use client";

import { cn } from "@/lib/utils";
import { 
  Book, 
  Check, 
  ChevronsUpDown, 
  HelpCircle, 
  Plus 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FloatingPortal,
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useInteractions,
  useRole
} from "@floating-ui/react";

// Mock types
type WorkspaceProps = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: string;
};

// Mock data
const MOCK_WORKSPACES: WorkspaceProps[] = [
  {
    id: "1",
    name: "Personal",
    slug: "personal",
    plan: "free",
  },
  {
    id: "2",
    name: "Acme Inc",
    slug: "acme",
    plan: "pro",
  },
  {
    id: "3",
    name: "Startup XYZ",
    slug: "startup",
    plan: "business",
  },
  {
    id: "4",
    name: "Enterprise Co",
    slug: "enterprise",
    plan: "enterprise",
  }
];

// Improved Popover component to match Dub.co
function Popover({ 
  children, 
  content, 
  openPopover, 
  setOpenPopover 
}: { 
  children: React.ReactNode; 
  content: React.ReactNode; 
  openPopover: boolean; 
  setOpenPopover: (open: boolean) => void; 
}) {
  const [mounted, setMounted] = useState(false);
  
  const {refs, floatingStyles, context} = useFloating({
    open: openPopover,
    onOpenChange: setOpenPopover,
    placement: "bottom-start",
    middleware: [
      offset(8),
      flip({padding: 8}),
      shift()
    ],
    whileElementsMounted: autoUpdate
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);
  
  const {getReferenceProps, getFloatingProps} = useInteractions([
    dismiss,
    role
  ]);
  
  // Handle mounting for client-side portal rendering
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <>
      <div 
        ref={refs.setReference} 
        {...getReferenceProps({
          onClick: () => setOpenPopover(!openPopover)
        })}
      >
        {children}
      </div>
      
      {mounted && openPopover && (
        <FloatingPortal>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-10 backdrop-blur-[1px]" onClick={() => setOpenPopover(false)} />
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              width: 'var(--popover-width)',
              '--popover-width': '256px',
              zIndex: 50,
            } as React.CSSProperties}
            className="animate-in slide-in-from-top-2 fade-in-0 duration-150 z-50 rounded-lg border border-neutral-200 bg-white drop-shadow-lg"
            {...getFloatingProps()}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

// Hook to track scroll progress including resize observation
function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const updateScrollProgress = useCallback(() => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      if (scrollHeight <= clientHeight) {
        setScrollProgress(1);
      } else {
        const progress = Math.min(scrollTop / (scrollHeight - clientHeight), 1);
        setScrollProgress(progress);
      }
    }
  }, [ref]);
  
  // Update on scroll
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.addEventListener('scroll', updateScrollProgress);
    return () => {
      element.removeEventListener('scroll', updateScrollProgress);
    };
  }, [ref, updateScrollProgress]);
  
  // Also update on resize
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateScrollProgress();
    });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [ref, updateScrollProgress]);
  
  return { scrollProgress, updateScrollProgress };
}

export function WorkspaceDropdown() {
  const { slug: currentSlug } = useParams() as { slug?: string };

  // Prevent slug from changing to empty to avoid UI switching during nav animation
  const [slug, setSlug] = useState(currentSlug);
  useEffect(() => {
    if (currentSlug) setSlug(currentSlug);
  }, [currentSlug]);

  // Mock user session
  const mockSession = {
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: "https://avatars.githubusercontent.com/u/1234567"
    }
  };

  const selected = useMemo(() => {
    const selectedWorkspace = MOCK_WORKSPACES.find(
      (workspace) => workspace.slug === slug,
    );

    if (slug && selectedWorkspace) {
      return {
        ...selectedWorkspace,
        image: selectedWorkspace.logo || `https://avatar.vercel.sh/${selectedWorkspace.name}`,
      };
    } else {
      return {
        name: mockSession.user.name || mockSession.user.email,
        slug: "/",
        image: mockSession.user.image || `https://avatar.vercel.sh/${mockSession.user.name}`,
        plan: "free",
      };
    }
  }, [slug, mockSession]);

  const [openPopover, setOpenPopover] = useState(false);

  return (
    <div>
      <Popover
        content={
          <WorkspaceList
            selected={selected}
            workspaces={MOCK_WORKSPACES}
            setOpenPopover={setOpenPopover}
          />
        }
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          className={cn(
            "flex w-full items-center justify-between rounded-lg p-1.5 text-left text-sm transition-all duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80",
            "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
            openPopover ? "bg-neutral-200/80" : ""
          )}
        >
          <div className="flex min-w-0 items-center gap-x-2.5 pr-2">
            <div className="h-7 w-7 flex-none shrink-0 overflow-hidden rounded-full bg-neutral-200 relative">
              {selected.image && (
                <Image 
                  src={selected.image}
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 block">
              <div className="truncate text-sm font-medium leading-5 text-neutral-900">
                {selected.name}
              </div>
              {selected.slug !== "/" && (
                <div className={cn("truncate text-xs capitalize leading-tight", getPlanColor(selected.plan))}>
                  {selected.plan}
                </div>
              )}
            </div>
          </div>
          <ChevronsUpDown
            className="size-4 shrink-0 text-neutral-400"
            aria-hidden="true"
          />
        </button>
      </Popover>
    </div>
  );
}

const LINKS = [
  {
    name: "Help Center",
    icon: HelpCircle,
    href: "#",
    target: "_blank",
  },
  {
    name: "Documentation",
    icon: Book,
    href: "#",
    target: "_blank",
  },
];

function WorkspaceList({
  selected,
  workspaces,
  setOpenPopover,
}: {
  selected: {
    name: string;
    slug: string;
    image: string;
    plan: string;
  };
  workspaces: WorkspaceProps[];
  setOpenPopover: (open: boolean) => void;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const pathname = usePathname();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollProgress, updateScrollProgress } = useScrollProgress(scrollRef);
  
  const href = useCallback(
    (slug: string) => {
      // Simple navigation logic that preserves the path structure
      return `/${slug}`;
    },
    []
  );

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onScroll={updateScrollProgress}
        className="relative max-h-80 w-full space-y-0.5 overflow-auto text-base sm:w-64 sm:text-sm"
      >
        <div className="flex flex-col gap-0.5 border-b border-neutral-200 p-2">
          {LINKS.map(({ name, icon: Icon, href, target }) => (
            <Link
              key={name}
              href={href}
              target={target}
              className={cn(
                "flex items-center gap-x-4 rounded-md px-2.5 py-2 transition-all duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80",
                "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
              )}
              onClick={() => setOpenPopover(false)}
            >
              <Icon className="size-4 text-neutral-500" />
              <span className="block truncate text-neutral-600">{name}</span>
            </Link>
          ))}
        </div>
        <div className="p-2">
          <div className="flex items-center justify-between pb-1">
            <p className="px-1 text-xs font-medium text-neutral-500">
              Workspaces
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {workspaces.map(({ id, name, slug, logo, plan }) => {
              const isActive = selected.slug === slug;
              return (
                <Link
                  key={slug}
                  className={cn(
                    "relative flex w-full items-center gap-x-2 rounded-md px-2 py-1.5 transition-all duration-75",
                    "hover:bg-neutral-200/50 active:bg-neutral-200/80",
                    "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
                    isActive && "bg-neutral-200/50",
                  )}
                  href={href(slug)}
                  onClick={() => setOpenPopover(false)}
                >
                  <div className="size-7 shrink-0 overflow-hidden rounded-full bg-neutral-200 relative">
                    {(logo || name) && (
                      <Image 
                        src={logo || `https://avatar.vercel.sh/${name}`}
                        alt={id}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <span className="block truncate text-sm leading-5 text-neutral-900 sm:max-w-[140px]">
                      {name}
                    </span>
                    {slug !== "/" && (
                      <div
                        className={cn(
                          "truncate text-xs capitalize leading-tight",
                          getPlanColor(plan),
                        )}
                      >
                        {plan}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-black">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              key="add"
              onClick={() => {
                setOpenPopover(false);
                setShowAddModal(true);
              }}
              className="group flex w-full cursor-pointer items-center gap-x-2 rounded-md p-2 text-neutral-700 transition-all duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80"
            >
              <Plus className="mx-1.5 size-4 text-neutral-500" />
              <span className="block truncate">Create new workspace</span>
            </button>

            {/* Mock modal - in real app this would be a proper modal */}
            {showAddModal && createPortal(
              <div className="fixed inset-0 z-[1050] bg-black/50 flex items-center justify-center" onClick={() => setShowAddModal(false)}>
                <div className="bg-white p-6 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-lg mb-4">Create New Workspace</h3>
                  <p className="text-sm text-neutral-600 mb-4">This is just a mock modal. Click anywhere outside to close.</p>
                  <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => setShowAddModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      </div>
      {/* Bottom scroll fade */}
      <div
        className="pointer-events-none absolute -bottom-px left-0 h-16 w-full rounded-b-lg bg-gradient-to-t from-white sm:bottom-0"
        style={{ opacity: 1 - Math.pow(scrollProgress, 2) }}
      />
    </div>
  );
}

const getPlanColor = (plan: string) =>
  plan === "enterprise"
    ? "text-purple-700"
    : plan === "advanced"
      ? "text-amber-800"
      : plan.startsWith("business")
        ? "text-blue-900"
        : plan === "pro"
          ? "text-cyan-900"
          : "text-neutral-500";
