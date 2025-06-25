declare module 'react-sparklines' {
  import { ComponentType } from 'react';
  export interface SparklinesProps {
    data: number[];
    width?: number;
    height?: number;
    margin?: number;
    svgWidth?: number | string;
    svgHeight?: number | string;
    preserveAspectRatio?: string;
    min?: number;
    max?: number;
    limit?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
  export const Sparklines: ComponentType<SparklinesProps>;

  export interface SparklinesLineProps {
    color?: string;
    style?: React.CSSProperties;
  }
  export const SparklinesLine: ComponentType<SparklinesLineProps>;

  // Export any other sub components if needed
} 