import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Что-то пошло не так</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Перезагрузить страницу</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;