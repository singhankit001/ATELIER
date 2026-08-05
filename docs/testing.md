# Testing Strategy

## Type Safety as the First Line of Defense
The application relies heavily on strict TypeScript configuration (`tsc --noEmit`). The domain layer heavily utilizes `Zod` schemas to guarantee API payloads and form inputs match expected structures at runtime.

## Unit Testing the Domain
Because the 5-Layer architecture completely strips React Native imports out of the `src/domain` layer, testing Zustand stores and data logic is trivial.
- **Store Tests**: We can invoke `useAuthStore.getState().login()` in a pure Node.js Jest environment without mocking Views, `<Text>`, or Navigation.

## Automated Runtime Constraints
- **Headless Build Validation**: `npx expo export` guarantees that all bundles, babel plugins, and assets compile identically for iOS and Android without cyclical dependency crashes.
