import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // You can also log the error to an error reporting service
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary-fallback p-4 border border-red-300 rounded bg-red-50 text-red-800">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">We're sorry, but there was an error loading this component.</p>
          <details className="mb-4">
            <summary className="cursor-pointer font-medium">View error details</summary>
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs">
              {this.state.error && this.state.error.toString()}
            </pre>
            {this.state.errorInfo && (
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;