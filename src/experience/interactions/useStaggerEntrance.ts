import { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { theme } from '../../core/theme/theme';

/**
 * useStaggerEntrance
 * The shared "grid card enters the screen" animation — opacity + a small
 * rise, staggered by index, capped so it never grows unbounded with list
 * length. Reduced motion drops the stagger and the rise entirely, down to
 * a plain, instant-feeling opacity fade — per the design system's
 * reduced-motion rule, not left to Reanimated's (non-)default behavior.
 */
export const useStaggerEntrance = (index: number = 0, maxSteps: number = 8, stepMs: number = 40) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return FadeIn.duration(theme.motion.durations.fast);
  }

  return FadeInDown.delay(Math.min(index, maxSteps) * stepMs).duration(theme.motion.durations.medium);
};
