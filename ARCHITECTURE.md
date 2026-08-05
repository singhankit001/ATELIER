# Architecture Overview

This document outlines the strict five-layer architecture that powers the Premium Digital Gallery application. The objective is to separate concerns entirely so that business logic, UI, motion, navigation, state, and rendering never intertwine in an unmanageable way.

## 1. Core Layer (`src/core`)
The infrastructure and foundation of the app. It holds no UI and no application-specific business rules.
- **API & Networking**: HTTP clients, interceptors.
- **Storage**: Persistent storage adapters (e.g., `expo-file-system`, `AsyncStorage`).
- **Theme Engine**: The system for design tokens, colors, typography definitions, and spacing (`tokens.ts`, `theme.ts`).
- **Utilities**: General-purpose helper functions and environment configuration.

## 2. Domain Layer (`src/domain`)
The brain of the application. It contains all business logic and state management, but is completely oblivious to React Native views, motion, or UI implementations.
- **Stores**: Zustand stores for Authentication (`useAuthStore`), Gallery (`useGalleryStore`), and Favorites (`useFavoritesStore`).
- **Models/Types**: TypeScript definitions (`ImageItem`, `User`).
- **Services**: Abstracted business operations (e.g., fetching gallery data, processing user registration).

## 3. Experience Layer (`src/experience`)
The soul of the application. It is responsible for how the app *feels*.
- **Motion Profiles**: Reanimated configurations (`usePressEffect`, `useSpatialTransition`).
- **Gestures**: Custom hooks for Pan, Pinch, and Swipe using React Native Gesture Handler.
- **Haptics**: Centralized tactile feedback patterns.
- **Scene Orchestration**: Background layers, global overlays (e.g., `MuseumBackground`, `PortalOverlay`).

## 4. Design Layer (`src/design`)
The visual language. It translates the Core theme tokens into reusable, primitive UI components.
- **Typography**: Reusable text components (`<Typography>`).
- **Interactive Primitives**: `<Button>`, `<TextField>`, `<SelectionField>`, `<PasswordField>`.
- **Feedback Primitives**: `<Toast>`.
- **Layouts**: `<SafeArea>`, `<Spacer>`.

## 5. Feature Layer (`src/features`)
The assembly layer. This is where the Domain logic, Experience motion, and Design components come together to form user-facing screens and flows.
- **Auth**: `RegisterScreen`, `LoginScreen`.
- **Gallery**: `GalleryScreen`, `ArtworkViewer`.
- **Favorites**: `FavoritesScreen`.
- **Profile**: `ProfileScreen`, `EditProfileModal`.

## Separation of Concerns Rules

- **No Domain in Design**: A `<Button>` should not know about `useAuthStore`. It should only receive an `onPress` callback.
- **No API Calls in Features**: A `GalleryScreen` should never call `fetch()`. It calls `galleryService.getFeed()`.
- **No Complex Animation in Features**: A screen should not house 20 lines of Reanimated interpolation. It should import a hook like `useSpatialTransition` from the Experience layer.
- **Theme Usage**: Colors and spacing must never be hardcoded. Always use `theme.colors...` or `theme.spacing...`.
