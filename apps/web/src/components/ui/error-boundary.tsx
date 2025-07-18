'use client';

import { Component, useCallback, useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component for handling unexpected errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Hook version of error boundary for function components
 */
export function useErrorBoundary() {
  const [error, setError] = useState<Error | undefined>();

  const reset = useCallback(() => {
    setError(undefined);
  }, []);

  const showBoundary = useCallback((err: Error) => {
    setError(err);
  }, []);

  return {
    error,
    reset,
    showBoundary,
  } as const;
} 