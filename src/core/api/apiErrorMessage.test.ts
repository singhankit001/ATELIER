import { resolveApiErrorMessage } from './apiErrorMessage';

describe('resolveApiErrorMessage', () => {
  it('prefers the backend message when one is present', () => {
    expect(resolveApiErrorMessage(false, 'Custom backend error')).toBe('Custom backend error');
    expect(resolveApiErrorMessage(true, 'Custom backend error')).toBe('Custom backend error');
  });

  it('falls back to a message containing "network" for a real network failure', () => {
    const message = resolveApiErrorMessage(true, undefined);
    // This exact substring check is what features/gallery/components/ErrorState.tsx
    // uses to decide whether to show "Connection Lost" — this test exists specifically
    // so that branch can never silently become unreachable again.
    expect(message.toLowerCase()).toContain('network');
  });

  it('falls back to a generic message for a non-network failure', () => {
    const message = resolveApiErrorMessage(false, undefined);
    expect(message.toLowerCase()).not.toContain('network');
    expect(message.toLowerCase()).not.toContain('fetch');
  });
});
