import { Component, ReactNode } from 'react';
import AdminRouteErrorState from './AdminRouteErrorState';
import { QueryClient } from '@tanstack/react-query';

interface Props {
  children: ReactNode;
  queryClient: QueryClient;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AdminRouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Admin route error boundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    // Invalidate admin verification queries for recovery
    this.props.queryClient.invalidateQueries({ queryKey: ['actor'] });
    this.props.queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    this.props.queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    
    // Reset error state
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <AdminRouteErrorState error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
