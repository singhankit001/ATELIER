# Motion System

## Physics over Timing
All spatial transitions in this application use Spring physics (`withSpring`) rather than linear timings (`withTiming`). 

### Why Springs?
Springs simulate physical reality. When a user swipes away an image with high velocity, the UI should inherit that velocity and momentum. `withTiming` ignores velocity, creating rigid, unnatural stops. Springs feel alive.

## Key Motion Hooks
- `usePressEffect`: Creates a subtle, shrinking glass-press effect used on `Button` and `GalleryItem`.
- `useSpatialTransition`: Orchestrates the expansion of a gallery grid image into a full-screen detailed artwork viewer using shared element-like scaling.
- `usePortalAnimation`: Manages the cinematic reveal sequence after authentication.

## Haptic Integration
Motion is always paired with Haptics.
- **Light Impact**: Used for subtle selections or standard button presses.
- **Medium Impact**: Used for state changes (e.g., toggling a favorite).
- **Success Notification**: Used for completing critical flows (e.g., successful login).
