# Performance Optimizations

## Gallery Virtualization
The core `GalleryScreen` relies heavily on `<FlatList>` or `<FlashList>` implementations optimized for infinite scrolling.
- **Estimated Item Size**: We pre-calculate spatial layouts to prevent jumping and thrashing.
- **Image Caching**: All artwork images are rendered via `expo-image` which uses advanced memory and disk caching under the hood, dramatically lowering JS thread usage.

## Motion Performance
- **UI Thread vs JS Thread**: All Reanimated transitions (`useSpatialTransition`) operate strictly on the native UI thread using worklets. This guarantees that even if the JS thread is blocked processing a massive API payload, the animations (like pinch-to-zoom) remain fluid at 60/120fps.
- **Memoization**: Expensive gallery items and nested components are wrapped in `React.memo` to prevent re-renders on global state changes.

## Global State Selectors
Zustand is leveraged with granular selectors. For instance:
```typescript
const isFavorite = useFavoritesStore(state => state.isFavorite(itemId));
```
Instead of subscribing the entire component to the massive `favorites` array, it only subscribes to the boolean change of its specific item, preventing mass re-renders of the grid.
