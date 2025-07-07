import { LayoutDashboard, BookOpen, Cog, Smile } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  /** Semantic variant for differentiating styling in course pane. */
  variant?: 'course' | 'module' | 'lesson';
  exact?: boolean;
  /** Optional click handler for leaf or parent link. */
  onClick?: () => void;
  items?: Omit<NavItem, 'icon'>[];
}

export interface NavSection {
  id: string;
  name?: string;
  items: NavItem[];
}

export const DEFAULT_NAV: NavSection[] = [
  {
    id: 'main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Courses', href: '/courses', icon: BookOpen },
      { name: 'Settings', href: '/settings', icon: Cog },
      { name: 'Superpage', href: '/superpage', icon: Smile },
    ],
  },
]; 