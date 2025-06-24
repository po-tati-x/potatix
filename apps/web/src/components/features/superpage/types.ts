// Superpage types
import type { DraggableProvided, DropResult } from '@hello-pangea/dnd';

export type LinkIconType = 'Link' | 'Instagram' | 'Twitter' | 'Youtube' | 'Github' | 'Facebook' | 'Mail' | 'FileText';

export type LinkType = 'link' | 'course' | 'github' | 'twitter' | 'youtube' | 'instagram' | 'facebook' | 'mail';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  type: LinkType;
  icon: LinkIconType;
  enabled: boolean;
}

export interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  theme: ThemeId;
  links: LinkItem[];
}

export type ThemeId = 'emerald' | 'slate' | 'amber' | 'blue' | 'red' | 'purple';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  buttonClass: string;
  bgClass: string;
  accentClass: string;
}

export interface ThemeSelectorProps {
  activeThemeId: ThemeId;
  themeOptions: ThemeOption[];
  onThemeChange: (themeId: ThemeId) => void;
}

export interface SuperpageHeaderProps {
  showPreview: boolean;
  saving: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onBack: () => void;
}

export interface LinkEditorProps {
  link: LinkItem;
  iconOptions: Record<LinkIconType, React.FC<{ className?: string }>>;
  onLinkChange: (id: string, field: string, value: string | boolean) => void;
  onDeleteLink: (id: string) => void;
  provided: DraggableProvided;
  isDragging: boolean;
}

export interface LinksTabProps {
  links: LinkItem[];
  iconOptions: Record<LinkIconType, React.FC<{ className?: string }>>;
  onAddLink: () => void;
  onLinkChange: (id: string, field: string, value: string | boolean) => void;
  onDeleteLink: (id: string) => void;
  onDragEnd: (result: DropResult) => void;
}

export interface AppearanceTabProps {
  profile: ProfileData;
  themeOptions: ThemeOption[];
  onProfileChange: (field: string, value: string) => void;
  onThemeChange: (themeId: ThemeId) => void;
}

export interface SettingsTabProps {
  username: string;
  onOpenPublicPage: () => void;
}

export interface PagePreviewProps {
  profile: ProfileData;
  activeTheme: ThemeOption;
  iconOptions: Record<LinkIconType, React.FC<{ className?: string }>>;
} 