import React from 'react';
import { AlertCircle, RefreshCw, Home, Video } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.search = '?page=home';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full flex-1 min-h-[360px] flex items-center justify-center p-4 bg-[#EDF7EC]">
          <div className="cartoon-card max-w-md w-full p-6 bg-white border-2 border-zinc-900 shadow-cartoon-lg text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FF4B4B] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon mb-3">
              <AlertCircle className="w-8 h-8 text-white stroke-[2.5]" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight mb-1">
              {this.props.title || 'Calling Stage Encountered an Issue'}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 font-medium mb-4 leading-relaxed max-w-sm">
              An unexpected error occurred while loading this view. You can reload this stage or return to the home screen.
            </p>

            {this.state.error?.message && (
              <div className="w-full mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-left font-mono text-[11px] text-red-700 overflow-x-auto max-h-24">
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 cartoon-btn cartoon-btn-mint !py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-cartoon-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Reload Stage</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 cartoon-btn bg-white hover:bg-zinc-100 !py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-cartoon-sm text-zinc-900"
              >
                <Home className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
