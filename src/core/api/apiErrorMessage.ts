/**
 * Pure decision logic for apiClient.ts's response interceptor, extracted
 * so it's unit-testable without mocking axios's transport layer.
 *
 * `ErrorState.tsx` decides whether to show "Connection Lost" (WifiOff
 * icon) vs. a generic error by checking whether the message contains
 * "network" or "fetch" — so a real network/timeout failure MUST produce
 * a message containing "network", or that branch is silently
 * unreachable. This was a real bug: the previous fallback message
 * ("An unexpected error occurred...") was used for every failure type,
 * so offline users always saw the generic error UI instead of the more
 * accurate, more helpful one that was clearly built for exactly their
 * situation.
 */
export const resolveApiErrorMessage = (
  isNetworkFailure: boolean,
  backendMessage?: string
): string => {
  if (backendMessage) return backendMessage;
  return isNetworkFailure
    ? 'Network error. Please check your internet connection and try again.'
    : 'An unexpected error occurred. Please try again.';
};
