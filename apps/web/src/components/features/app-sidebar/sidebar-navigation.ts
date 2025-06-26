import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Cog,
  Smile,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  exact?: boolean;
  items?: Omit<NavItem, 'icon'>[];
}

export interface NavSection {
  id: string;
  name?: string;
  items: NavItem[];
}

export interface AreaConfig {
  title?: string;
  backHref?: string;
  sections: NavSection[];
}

export type NavigationArea = 'default' | 'workspaceSettings' | 'userSettings';

// Default navigation (no slug needed)
const DEFAULT_NAVIGATION: AreaConfig = {
  sections: [
    {
      id: 'main',
      items: [
        {
          name: 'Dashboard',
          icon: LayoutDashboard,
          href: '/dashboard',
        },
        {
          name: 'My Courses',
          icon: BookOpen,
          href: '/courses',
        },
        {
          name: 'Settings',
          icon: Cog,
          href: '/settings',
        },
        {
          name: 'Superpage',
          icon: Smile,
          href: '/superpage',
        },
      ],
    },
  ],
};

// User settings navigation (no slug needed)
const USER_SETTINGS_NAVIGATION: AreaConfig = {
  title: 'Settings',
  backHref: '/dashboard',
  sections: [
    {
      id: 'account',
      name: 'Account',
      items: [
        {
          name: 'General',
          icon: Cog,
          href: '/account/settings',
          exact: true,
        },
        {
          name: 'Security',
          icon: Cog,
          href: '/account/settings/security',
        },
      ],
    },
  ],
};

// Workspace settings navigation (slug required)
function getWorkspaceSettingsNavigation(slug: string): AreaConfig {
  return {
    title: 'Settings',
    backHref: `/${slug}`,
    sections: [
      {
        id: 'workspace',
        name: 'Workspace',
        items: [
          {
            name: 'General',
            icon: Cog,
            href: `/${slug}/settings`,
            exact: true,
          },
          {
            name: 'Billing',
            icon: Cog,
            href: `/${slug}/settings/billing`,
          },
          {
            name: 'Security',
            icon: Cog,
            href: `/${slug}/settings/security`,
          },
        ],
      },
    ],
  };
}

// Hook to determine current navigation area
export function useNavigationArea(slug: string): NavigationArea {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname.startsWith('/account/settings')) {
      return 'userSettings';
    }
    if (pathname.startsWith(`/${slug}/settings`)) {
      return 'workspaceSettings';
    }
    return 'default';
  }, [pathname, slug]);
}

// Hook to get navigation configuration for current area
export function useNavigationConfig(slug: string): AreaConfig {
  const area = useNavigationArea(slug);

  return useMemo(() => {
    switch (area) {
      case 'workspaceSettings':
        return getWorkspaceSettingsNavigation(slug);
      case 'userSettings':
        return USER_SETTINGS_NAVIGATION;
      case 'default':
      default:
        return DEFAULT_NAVIGATION;
    }
  }, [area, slug]);
} 