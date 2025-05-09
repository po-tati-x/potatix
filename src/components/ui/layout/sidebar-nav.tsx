"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Cog, 
  ChevronDown, 
  ChevronLeft, 
  BookOpen,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ReactNode, useMemo, useState } from "react"; 

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  items?: Omit<NavItem, 'icon'>[];
};

type NavSection = {
  name?: string;
  items: NavItem[];
};

type SidebarProps = {
  slug: string;
  toolContent?: ReactNode;
  newsContent?: ReactNode;
  bottom?: ReactNode;
};

export function Sidebar({ slug, toolContent, newsContent, bottom }: SidebarProps) {
  const pathname = usePathname();
  
  // Determine current area
  const currentArea = useMemo(() => {
    return pathname.startsWith("/account/settings")
      ? "userSettings"
      : pathname.startsWith(`/${slug}/settings`)
        ? "workspaceSettings"
        : "default";
  }, [pathname, slug]);

  // Define nav sections based on current area
  const navSections = useMemo((): NavSection[] => {
    // Default area (main navigation)
    if (currentArea === "default") {
      return [
        {
          items: [
            {
              name: "Dashboard",
              icon: LayoutDashboard,
              href: `/dashboard`,
            },
            {
              name: "My Courses",
              icon: BookOpen,
              href: `/courses`,
            },
            {
              name: "Settings",
              icon: Cog,
              href: `/settings`,
            },
          ],
        },
      ];
    } 
    
    // Workspace settings area
    else if (currentArea === "workspaceSettings") {
      return [
        {
          name: "Workspace",
          items: [
            {
              name: "General",
              icon: Cog,
              href: `/${slug}/settings`,
              exact: true,
            },
            {
              name: "Billing",
              icon: Cog,
              href: `/${slug}/settings/billing`,
            },
            {
              name: "Security",
              icon: Cog,
              href: `/${slug}/settings/security`,
            },
          ],
        },
      ];
    } 
    
    // User settings area
    else if (currentArea === "userSettings") {
      return [
        {
          name: "Account",
          items: [
            {
              name: "General",
              icon: Cog,
              href: "/account/settings",
              exact: true,
            },
            {
              name: "Security",
              icon: Cog,
              href: "/account/settings/security",
            },
          ],
        },
      ];
    }
    
    return [];
  }, [currentArea, pathname, slug]);

  // Get title and back link for current area
  const areaDetails = useMemo(() => {
    if (currentArea === "workspaceSettings" || currentArea === "userSettings") {
      return {
        title: "Settings",
        backHref: `/${slug}`,
      };
    }
    return { title: "", backHref: "" };
  }, [currentArea, slug]);

  return (
    <div className="scrollbar-hide relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
      <nav className="relative flex grow flex-col p-3 text-neutral-800">
        {/* Header */}
        <div className="relative flex items-start justify-between gap-1 pb-3">
          {/* Title with back button or logo */}
          <Link
            href={areaDetails.backHref || "/"}
            className={cn(
              "rounded-md px-1 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black/50",
              (!areaDetails.title || !areaDetails.backHref) && "mb-1"
            )}
          >
            {areaDetails.title && areaDetails.backHref ? (
              <div className="py group -my-1 -ml-1 flex items-center gap-2 py-2 pr-1 text-sm font-medium text-neutral-800">
                <ChevronLeft className="size-4 text-neutral-600 transition-transform duration-100 group-hover:-translate-x-0.5" />
                {areaDetails.title}
              </div>
            ) : (
              <div className="h-6 font-bold text-neutral-800">POTATIX</div>
            )}
          </Link>
            
          {/* Right side items */}
          <div className="hidden items-center gap-3 md:flex">
            {toolContent}
            <div className="h-8 w-8 rounded-full bg-gray-200"></div> {/* Placeholder */}
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex flex-col gap-4 pt-4">
          {navSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="flex flex-col gap-0.5">
              {section.name && (
                <div className="mb-2 pl-1 text-sm font-semibold text-neutral-700">
                  {section.name}
                </div>
              )}
              
              {section.items.map((item) => (
                <SidebarItem key={item.name} item={item} />
              ))}
            </div>
          ))}
        </div>

        {/* News Content */}
        <AnimatePresence>
          {currentArea === "default" && newsContent && (
            <motion.div
              className="-mx-3 flex grow flex-col justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.1,
                ease: "easeInOut",
              }}
            >
              {newsContent}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom Content */}
      {bottom && (
        <div className="relative flex flex-col justify-end">{bottom}</div>
      )}
    </div>
  );
}

// Sidebar navigation item component
function SidebarItem({ item }: { item: NavItem }) {
  const { name, href, icon: Icon, exact, items } = item;
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  const isActive = useMemo(() => {
    const hrefWithoutQuery = href.split("?")[0];
    return exact
      ? pathname === hrefWithoutQuery
      : pathname.startsWith(hrefWithoutQuery);
  }, [pathname, href, exact]);

  return (
    <div>
      <Link
        href={href}
        data-active={isActive}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={cn(
          "group flex items-center gap-2.5 rounded-md p-2 text-sm leading-none text-neutral-600 transition-[background-color,color,font-weight] duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80",
          "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
          isActive &&
            !items &&
            "bg-blue-100/50 font-medium text-blue-600 hover:bg-blue-100/80 active:bg-blue-100"
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "size-4 text-neutral-500 transition-colors duration-75",
              !items && isActive && "text-blue-600"
            )}
          />
        )}
        <span className="font-medium">{name}</span>
        {items && (
          <div className="flex grow justify-end">
            <ChevronDown className="size-3.5 text-neutral-500 transition-transform duration-75 group-data-[active=true]:rotate-180" />
          </div>
        )}
      </Link>

      {/* Submenu items */}
      {items && (
        <div
          className={cn(
            "transition-all duration-200 overflow-hidden",
            isActive ? "max-h-96" : "max-h-0 opacity-0"
          )}
          aria-hidden={!isActive}
        >
          <div className="pl-px pt-1">
            <div className="pl-3.5">
              <div className="flex flex-col gap-0.5 border-l border-neutral-200 pl-2">
                {items.map((subItem) => (
                  <SubItem key={subItem.name} item={subItem} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified sub-item component (for nested navigation)
function SubItem({ item }: { item: Omit<NavItem, 'icon'> }) {
  const { name, href, exact } = item;
  const pathname = usePathname();

  const isActive = useMemo(() => {
    const hrefWithoutQuery = href.split("?")[0];
    return exact
      ? pathname === hrefWithoutQuery
      : pathname.startsWith(hrefWithoutQuery);
  }, [pathname, href, exact]);

  return (
    <Link
      href={href}
      data-active={isActive}
      className={cn(
        "group flex items-center gap-2.5 rounded-md p-2 text-sm leading-none text-neutral-600 transition-[background-color,color,font-weight] duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
        isActive && "bg-blue-100/50 font-medium text-blue-600 hover:bg-blue-100/80 active:bg-blue-100"
      )}
    >
      <span className="font-medium">{name}</span>
    </Link>
  );
} 