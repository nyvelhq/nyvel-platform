import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * ErrorBoundary — catches render errors and displays a fallback UI
 * Prevents white-screen crashes; logs to console for debugging
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
          <div className="card max-w-md w-full">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                  Something went wrong
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  We encountered an unexpected error. Please try refreshing the page or return to the home page.
                </p>
              </div>
              <Button
                onClick={this.handleReset}
                className="w-full"
              >
                Return to Home
              </Button>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
