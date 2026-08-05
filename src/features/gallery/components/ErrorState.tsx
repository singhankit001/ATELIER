import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react-native';
import { EmptyState } from './EmptyState';
import { theme } from '../../../core/theme/theme';

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  // Determine if it's a network error (often lacks status or has specific messages)
  const isNetworkError = error?.message?.toLowerCase().includes('network') || 
                         error?.message?.toLowerCase().includes('fetch');

  return (
    <EmptyState
      icon={
        isNetworkError 
          ? <WifiOff size={48} color={theme.colors.error} />
          : <AlertTriangle size={48} color={theme.colors.error} />
      }
      title={isNetworkError ? "Connection Lost" : "Something went wrong"}
      message={
        isNetworkError 
          ? "We couldn't connect to the gallery. Please check your internet connection."
          : "We encountered an unexpected error while loading the exhibition."
      }
      resetLabel="Try Again"
      onReset={onRetry}
    />
  );
};
