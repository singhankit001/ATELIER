# Changelog

All notable changes to the **ATELIER** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-05

### Added
- **Core Architecture:** 5-layer modular architecture (`core`, `design`, `experience`, `features`, `navigation`).
- **Picsum Integration:** Strict integration with official `https://picsum.photos/v2/list?page=1&limit=30` endpoint.
- **Expo SDK 57 Support:** Complete migration to Expo SDK 57, React Native 0.86.2, and React 19.2.3.
- **Dynamic Theme Engine:** HSL token-based reactive theme system with dark/light mode switching across all components.
- **Spatial 3D Animations:** Native UI thread 3D parallax scroll tilting using Reanimated 4 and `useScrollParallax`.
- **Artwork Viewer:** Full-screen modal viewer with double-tap zoom, pan gestures, image saving (`expo-media-library`), and sharing (`expo-sharing`).
- **Location Autocomplete:** Full-screen modal location autocomplete powered by OpenStreetMap Nominatim with India-specific suggestions.
- **Favorites Salon:** Client-side persistence using Zustand and AsyncStorage.
- **Unified Slim Search:** Integrated 42px slim search bar with inline filter chips (`All`, `A-M`, `N-Z`).
- **Quality Assurance:** 100% test coverage for type safety (`npx tsc --noEmit`) and Expo health checks (`npx expo-doctor`).
