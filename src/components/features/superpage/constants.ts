import {
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Github,
  Facebook,
  Mail,
  FileText
} from 'lucide-react';
import { ThemeOption, LinkIconType } from './types';

// Available icons for links
export const ICON_OPTIONS: Record<LinkIconType, React.FC<{ className?: string }>> = {
  'Link': LinkIcon,
  'Instagram': Instagram,
  'Twitter': Twitter,
  'Youtube': Youtube,
  'Github': Github,
  'Facebook': Facebook,
  'Mail': Mail,
  'FileText': FileText,
};

// Available themes
export const THEME_OPTIONS: ThemeOption[] = [
  { 
    id: 'emerald', 
    name: 'Emerald',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    bgClass: 'bg-emerald-50',
    accentClass: 'border-emerald-600 text-emerald-800', 
  },
  { 
    id: 'slate', 
    name: 'Slate',
    buttonClass: 'bg-slate-800 hover:bg-slate-900 text-white',
    bgClass: 'bg-slate-50',
    accentClass: 'border-slate-800 text-slate-800',
  },
  { 
    id: 'amber', 
    name: 'Amber',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    bgClass: 'bg-amber-50', 
    accentClass: 'border-amber-600 text-amber-800',
  },
  { 
    id: 'blue', 
    name: 'Blue',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    bgClass: 'bg-blue-50',
    accentClass: 'border-blue-600 text-blue-800', 
  },
  { 
    id: 'red', 
    name: 'Red',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    bgClass: 'bg-red-50',
    accentClass: 'border-red-600 text-red-800',
  },
  { 
    id: 'purple', 
    name: 'Purple',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white', 
    bgClass: 'bg-purple-50',
    accentClass: 'border-purple-600 text-purple-800',
  },
]; 