import { Component, ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import AdminRouteErrorState from './AdminRouteErrorState';

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
    console.error('Admin route error:', error, errorInfo);
  }

  handleRetry = () => {
    // Invalidate actor and admin verification queries
    this.props.queryClient.invalidateQueries({ queryKey: ['actor'] });
    this.props.queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    
    // Reset error state
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <AdminRouteErrorState onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
