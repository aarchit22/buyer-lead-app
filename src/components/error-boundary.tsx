'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="panel text-center space-y-4 p-8">
          <div className="text-6xl">😕</div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted">
            An unexpected error occurred. Please refresh the page and try again.
          </p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn btn-outline"
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="text-left bg-red-50 dark:bg-red-900/20 p-4 rounded text-sm">
              <summary className="cursor-pointer font-medium">Error Details (Dev Only)</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
