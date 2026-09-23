import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during SSR and the hydration render, true afterwards (and immediately
 * on client-side navigations). Use it to gate output that depends on
 * client-only state, such as the resolved theme, without a hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
