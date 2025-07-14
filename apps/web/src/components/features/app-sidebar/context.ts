import { createContext, Dispatch, SetStateAction } from 'react';
import type { SidebarArea } from './hooks';

export interface SideNavContextType {
  /** When set, overrides automatic pane detection. */
  overrideArea: SidebarArea | undefined;
  setOverrideArea: Dispatch<SetStateAction<SidebarArea | undefined>>;
}

export const SideNavContext = createContext<SideNavContextType>({
  overrideArea: undefined,
  setOverrideArea: () => {},
}); 