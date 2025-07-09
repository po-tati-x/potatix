import { createContext, Dispatch, SetStateAction } from 'react';
import type { SidebarArea } from './hooks';

export interface SideNavContextType {
  /** When set, overrides automatic pane detection. */
  overrideArea: SidebarArea | null;
  setOverrideArea: Dispatch<SetStateAction<SidebarArea | null>>;
}

export const SideNavContext = createContext<SideNavContextType>({
  overrideArea: null,
  setOverrideArea: () => {},
}); 