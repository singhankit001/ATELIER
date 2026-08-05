# The Experience Engine

## Philosophy
Standard mobile apps rely heavily on standard linear screen transitions and basic opacity fades. Premium applications feel different—they are responsive, spatial, and tactile. The Experience Engine isolates this specific domain of engineering.

## Responsibilities
- **Gestures**: Translating human touch into mathematical vectors.
- **Physics**: Using spring mechanics rather than linear durations for animations.
- **Haptics**: Anchoring visual feedback with tactile response.
- **Global Orchestration**: Elements like the `MuseumBackground` and `PortalOverlay` which exist outside the standard React Navigation stack.

## Why abstract it?
By abstracting Reanimated `useSharedValue` and `useAnimatedStyle` into hooks within the Experience Engine, the Feature Layer developers can wrap components in fluid motion without needing to understand the underlying mathematics of Bezier curves or spring stiffness.
