import { createContext, Dispatch, SetStateAction } from 'react';
import type { SidebarArea } from './hooks';

export interface SideNavContextType {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  /** When set, overrides automatic pane detection. */
  overrideArea: SidebarArea | null;
  setOverrideArea: Dispatch<SetStateAction<SidebarArea | null>>;
}

export const SideNavContext = createContext<SideNavContextType>({
  isOpen: false,
  setIsOpen: () => {},
  overrideArea: null,
  setOverrideArea: () => {},
}); 