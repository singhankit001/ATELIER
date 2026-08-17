# ATELIER

A premium, museum-inspired image gallery built with **React Native + Expo SDK 57**.

## Assignment

Built as a submission for the **React Native Intern Assignment**: a mock-authenticated image gallery consuming a real public API (Picsum Photos), with infinite pagination, search/filtering, persistent favorites, a full-screen artwork viewer, on-device download, and a profile screen — packaged as an installable Android APK.

## Overview

ATELIER is a mobile gallery app that fetches real photography from the [Picsum Photos API](https://picsum.photos), presents it in an infinitely-scrolling two-column grid, and layers on account creation/login, search & filtering, favoriting, full-screen artwork viewing with zoom/pan, on-device download, native sharing, and a themeable profile with light/dark mode.

The visual language is a custom **animated glassmorphism design system**: translucent glass cards, soft ambient glow, and spring-based press/entrance motion (via Reanimated 4), rather than any stock component library.

There is no backend. Authentication is a local, mock, AsyncStorage-persisted account system by design (see [Authentication](#authentication)) — the only real network dependencies are the Picsum API and OpenStreetMap's Nominatim geocoder.

## Features

- **Gallery** — infinite-scroll, two-column masonry-style grid sourced live from Picsum, pull-to-refresh, skeleton loading state, empty/error states.
- **Search & Filter** — debounced author/id search combined with an A–M / N–Z author-initial filter chip.
- **Artwork Viewer** — full-screen modal with pinch/double-tap zoom, pan, download-to-device, and native share sheet.
- **Favorites** — persistent, offline-first favoriting; survives app restarts.
- **Authentication** — email/password login and registration with a mock local account store, form validation, and session persistence.
- **Location Autocomplete** — India-restricted address search + "use my current location" (live GPS) on the registration form, powered by OpenStreetMap Nominatim.
- **Profile** — avatar selection, editable personal details, light/dark/system theme switch, sign out.
- **Light & Dark Theme** — every screen and component reacts live to `useAppTheme()`; no hardcoded colors outside the token file.
- **Reduced Motion Support** — every non-trivial animation checks `useReducedMotion()` and degrades to a simple fade or an instant state change.

## Tech Stack

| Layer | Choice |
| :--- | :--- |
| Framework | Expo SDK 57 (React Native 0.86.2, React 19.2) |
| Language | TypeScript 6.0, strict mode |
| Navigation | React Navigation 6 (native-stack + bottom-tabs) |
| Server/cache state | TanStack Query v5 (`useInfiniteQuery`) |
| Client/app state | Zustand 5 |
| Forms & validation | React Hook Form + Zod v4 |
| Animation | Reanimated 4 + `react-native-worklets` |
| Networking | Axios |
| Persistence | `@react-native-async-storage/async-storage`, behind a storage abstraction |
| Media | `expo-image`, `expo-file-system` (SDK 57's `File`/`Paths` API), `expo-media-library`, `expo-sharing` |
| Location | `expo-location` + OpenStreetMap Nominatim |
| Testing | Jest + `jest-expo` + `@testing-library/react-native` |

## Architecture

The codebase follows a 5-layer, feature-first structure. Lower layers never import from higher ones.

```text
src/
├── core/          # Layer 1 — theme tokens, storage abstraction, API client, error boundary
├── design/        # Layer 2 — reusable, feature-agnostic UI primitives (Button, TextField, GlassCard...)
├── experience/     # Layer 3 — shared motion/animation primitives and ambient scene backgrounds
├── features/       # Layer 4 — one folder per domain (auth, gallery, favorites, profile, sharing),
│                    #           each split into screens/ components/ controllers/ services/ store/
└── navigation/      # Layer 5 — React Navigation stacks, tab bar, and the auth↔app transition
```

Within each feature, the convention is:

- **`services/`** — I/O: network calls, filesystem, storage reads/writes.
- **`store/`** or **`controllers/`** — either a Zustand store (client state, e.g. `useAuthStore`, `useFavoritesStore`) or a controller hook wrapping TanStack Query (server state, e.g. `useGalleryController`).
- **Pure logic modules** (e.g. `authLogic.ts`, `galleryFilter.ts`, `favoritesLogic.ts`) — business rules extracted with zero React/React Native/network imports, so they're unit-testable in plain Node without mocking native modules. The store/service files are thin I/O wrappers around these.
- **`screens/` / `components/`** — presentation.

## State Management

Two different tools, deliberately used for two different kinds of state:

- **TanStack Query** owns server state — the gallery feed. `useGalleryController` wraps `useInfiniteQuery`, exposing `images`, `loadMore`, `hasMore`, `isLoadingMore`, and a `refetch` that resets to a clean page 1 (not React Query's default "refetch every loaded page," which gets slower the more a user has scrolled).
- **Zustand** owns client/app state — the authenticated user (`useAuthStore`), favorites (`useFavoritesStore`), and the theme mode (`useThemeStore`). Both auth and favorites persist to AsyncStorage through the same `core/storage/storage.ts` abstraction, and rehydrate on app launch.

## Persistence

Everything below goes through one shared abstraction (`core/storage/storage.ts`, a thin typed wrapper over `@react-native-async-storage/async-storage`) rather than each feature touching `AsyncStorage` directly. Exactly five keys are ever written:

| Key | Written by | Contains |
| :--- | :--- | :--- |
| `AUTH_TOKEN` | `useAuthStore.login()` | The mock session token string |
| `AUTH_USER` | `useAuthStore.login()` / `.updateProfile()` | The full `User` object — name, email, gender, mobile, address, city, state, avatarUrl |
| `REGISTERED_ACCOUNTS_REGISTRY` | `authService.register()` | A map of `email → { user, passwordHash }` for every account created via Register (the mock "backend") |
| `FAVORITES` | `useFavoritesStore.toggleFavorite()` | The array of full `ImageItem` objects currently favorited |
| `THEME_MODE` | `useThemeStore.setMode()` | The chosen `'system' \| 'light' \| 'dark'` string |

Nothing else is persisted — the gallery feed itself is intentionally **not** written to `AsyncStorage`; it's re-fetched from Picsum on every cold start rather than cached to disk, so it's always showing current data. On launch, `RootNavigator` calls `useAuthStore.hydrate()`, `useFavoritesStore.hydrate()`, and `useThemeStore.hydrate()` in one effect, which read these keys back and restore state before the first screen renders — this is the exact mechanism a force-close/reopen relies on.

This exact bug was caught and fixed during this hardening pass: `useThemeStore.hydrate()` existed and `setMode()` was correctly writing `THEME_MODE` on every change, but nothing ever *called* `hydrate()` on launch — so a chosen Dark/Light mode silently reverted to System after every restart despite being genuinely persisted the whole time. `RootNavigator` now hydrates all three stores. See `useAuthStore.test.ts` / `useFavoritesStore.test.ts` / `useThemeStore.test.ts` for automated proof of each round-trip against a real (mocked) `AsyncStorage`.

## API

The gallery is powered exclusively by the real Picsum Photos v2 API — no mock/fabricated image data:

```
GET https://picsum.photos/v2/list?page={page}&limit=50
```

`limit=50` (raised from the originally-specified `limit=30` at the project owner's explicit request, to show more images per page — documented in `ASSIGNMENT_COMPLIANCE.md`). All image metadata (id, author, dimensions, download URL) is used as returned by the API; nothing is invented client-side.

Address autocomplete and reverse-geocoding use OpenStreetMap's Nominatim, restricted to India (`countrycodes=in`):

```
GET https://nominatim.openstreetmap.org/search?...&countrycodes=in
GET https://nominatim.openstreetmap.org/reverse?...
```

`core/api/apiClient.ts` is a shared Axios instance with request/response interceptors (auth header injection, retry-with-backoff on network failure, sanitized error messages) — currently only consumed by the gallery service, ready for any future authenticated backend.

## Authentication

Authentication is a **local mock system**, by design — the assignment has no real backend to authenticate against. It behaves like a real auth flow (validated forms, hashed-in-storage-shaped credentials, persisted session, token-gated navigation) but the "server" is `AsyncStorage`:

- A seed account is always available for reviewers: **`test@example.com` / `password`**.
- New accounts registered via the Register screen are stored in an `AccountsRegistry` in AsyncStorage; login checks the seed account first, then this registry.
- A **Continue as guest** option is available on the login screen for immediate access without creating an account.
- On successful login, `useAuthStore.login()` persists `AUTH_TOKEN`/`AUTH_USER` and flips `isAuthenticated` immediately — the fade transition into the app (`AuthTransitionOverlay`) is a purely cosmetic overlay layered on top and can never gate or delay real authentication.
- On launch, `hydrate()` reads the persisted session with a 3-second failsafe timeout, so a slow storage read can never hang the app on a loading spinner.
- Passwords are validated (min length, etc.) via Zod; a wrong email and a wrong password both surface the same generic error message, so the login form never leaks which one was incorrect.

## Pagination

The gallery uses real infinite scroll against the Picsum API via `useInfiniteQuery`:

- Each page requests `limit=50` items; `getNextPageParam` returns `undefined` once a page comes back short (the natural end of the Picsum catalog), which flips off further fetching.
- Pages are flattened into a single list with defensive de-duplication by image `id` across page boundaries (`flattenGalleryPages`).
- `loadMore()` triggers on `FlatList`'s `onEndReached`, guarded against firing while search/filter is active (see below) or a fetch is already in flight.
- Pull-to-refresh resets the query to a clean page 1 rather than re-fetching every page already scrolled through.

## Search & Filtering

- A debounced (300 ms) search box matches against author name or image id, case-insensitively.
- An A–M / N–Z chip filters by the author's first-name initial.
- Both apply together, client-side, over the pages already loaded — **not** over the full remote catalog. Picsum's API has no author-search endpoint to page a query against, so once a search or filter is active, `hasMore` reports `false` and further pagination pauses; this is a deliberate, documented scope boundary (see [Known Limitations](#known-limitations)), not an oversight.

## Favorites

- Favoriting stores the **full `ImageItem` object**, not just its id — under infinite pagination, an id-only favorites list could reference a page the user never actually fetched, making it impossible to render later. Storing the full object means favorites always render correctly regardless of gallery pagination state.
- Persisted to AsyncStorage (`favoritesRepository.ts`) and rehydrated on launch; toggling is optimistic and instant.
- The Favorites screen shares its card component/layout and animation primitives with the Gallery grid — one visual implementation, not two.

## Image Download

- `artworkRepository.downloadAndSaveImage()` downloads the full-resolution image to the app's cache directory using Expo SDK 57's rewritten `File`/`Paths` filesystem API (the older `FileSystem.downloadAsync` throws at runtime on this SDK version), then saves it into the device's photo library via `expo-media-library` and deletes the temp file — success or failure.
- Requests **write-only** media permission (`MediaLibrary.requestPermissionsAsync(true)`) since the app only ever adds a new asset and never reads the existing library.
- The download button shows a progress state and a checkmark success state (auto-resets after ~1.4s), and surfaces a typed `ArtworkError` (`PERMISSION_DENIED` / `DOWNLOAD_FAILED` / `SAVE_FAILED`) on failure instead of a silent no-op.
- Sharing (`features/sharing/`) is a separate, equally SDK57-rewritten path: download-to-cache → native share sheet (`expo-sharing`) → guaranteed cleanup in a `finally` block.

**A real bug shipped here and was fixed**: `expo-media-library` had the exact same kind of SDK57 rewrite as `expo-file-system` — `MediaLibrary.createAssetAsync()`/`createAlbumAsync()` (the functions this code originally called) are now guaranteed-throw stubs pointing at a separate `expo-media-library/legacy` import, while the real, working API moved to a class-based `Asset.create()` / `Album.get()` / `Album.create()` / `album.add()` surface. The old and new functions have identical-enough TypeScript signatures that `tsc --noEmit` stayed clean the entire time — every single download attempt was throwing at runtime, and no automated check caught it until it was reported from actual use. Fixed by migrating to the class-based API (confirmed against the installed package's actual source, not assumed), and a regression test (`artworkRepository.test.ts`) now asserts the *specific* real methods are called, not just that download succeeds — so a reintroduction of the deprecated names fails `npm test`.

## Profile

- Editable name, avatar (chosen from a curated set of portraits), and the personal details captured at registration (mobile, gender, address, city/state) — each row only renders once real data exists, no placeholder/fake rows.
- Theme mode (System / Light / Dark) is stored via `useThemeStore` and persisted; every screen's colors derive from `useAppTheme()`, so the switch applies instantly app-wide.
- Sign out clears the persisted session and returns to the auth flow, confirmed via a destructive-styled confirmation dialog.

## Error Handling

- **Network layer**: the shared Axios client retries transient/network failures up to 3 times with exponential backoff, and normalizes all errors into a single sanitized message before it ever reaches UI code.
- **Gallery**: a dedicated `ErrorState` component (distinct from the empty-search state) with a retry action if the initial fetch fails.
- **Forms**: Zod schemas surface field-level, human-readable messages (not raw validator output) inline under each field.
- **Crash containment**: `ErrorBoundary` wraps each major navigator/screen boundary so a failure in one feature can't blank the entire app.
- **Download/Share**: typed error classes (`ArtworkError`, `SharingError`) with specific error codes, surfaced to the user as a toast rather than swallowed.

## Testing

Business logic is deliberately extracted into pure, dependency-free modules specifically so it can be unit-tested without mocking React Native or native modules:

```bash
npm test
```

83 tests across 11 suites, all passing:

| Suite | What it covers |
| :--- | :--- |
| `authLogic.test.ts` | Pure login resolution, duplicate-email detection, account creation |
| `authService.test.ts` | **Integration**, against a real (mocked) `AsyncStorage`: register → persists → a later login reads it back; duplicate email is rejected; wrong password is rejected; guest sessions never touch the registry |
| `useAuthStore.test.ts` | **Integration**: a logged-in session, and a logged-out session, both survive a simulated app restart (reset in-memory state → re-`hydrate()` from the same storage) |
| `useFavoritesStore.test.ts` | **Integration**: favoriting/un-favoriting survives a simulated restart |
| `useThemeStore.test.ts` | **Integration**: chosen theme mode survives a simulated restart (regression test for the hydration-never-called bug fixed in this pass) |
| `artworkRepository.test.ts` | **Integration**, mocked native modules: asserts download/save calls the real `Asset.create`/`Album.*` API, never the deprecated `createAssetAsync`/`createAlbumAsync` stubs (regression test for the download bug fixed in this pass); permission-denied, download-failure, and save-failure error paths; progress callback |
| `registerSchema.test.ts` / `loginSchema.test.ts` / `profileSchema.test.ts` | Zod validation rules and error messages — every explicit edge case (empty fields, invalid email, mobile ≠ 10 digits, password < 6 chars, password mismatch) |
| `galleryFilter.test.ts` | Page flattening/de-dup, search+filter combination, next-page-param logic |
| `favoritesLogic.test.ts` | Favorite toggling/lookup |

The "integration" suites above run against `@react-native-async-storage/async-storage`'s official Jest mock (wired in `jest.setup.js`), so they exercise the real read/write/serialize path — not just the pure logic in isolation. That's a genuine automated proxy for "force-close and reopen," though it's still not a substitute for physically doing that on a device — see [Known Limitations](#known-limitations).

UI/interaction testing (taps, gestures, navigation) was verified manually via iOS Simulator + screenshot inspection during development, since this sandbox has no touch-automation tool and no Android device/emulator/`adb` — see [Known Limitations](#known-limitations) for exactly what that does and doesn't cover.

## Setup

**Prerequisites**: Node.js 18+, npm, and either the Expo Go app (fastest) or Xcode/Android Studio for a simulator.

```bash
git clone <this-repo>
cd ATELIER-1.0.0
npm install

npx expo-doctor      # verify dependency/config health
npx tsc --noEmit      # verify TypeScript
npm test              # run the unit test suite

npx expo start        # launch Metro; scan the QR code in Expo Go, or press i/a for a simulator
```

Log in with the seed account (`test@example.com` / `password`), register a new account, or tap **Continue as guest**.

## Android APK

The project is configured for EAS Build with a `preview` profile (`eas.json`) that produces an installable `.apk` (rather than the Play-Store-only `.aab`):

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

This requires an Expo/EAS account (free tier is sufficient) and runs on Expo's cloud build infrastructure — no local Android SDK needed. `app.json`'s Android manifest is scoped to exactly what the app uses: `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION` (GPS on the registration form) and the media-save permission set required by `expo-media-library` for the download feature — no photo-library *read* permission is requested, since the app never picks from or browses the device's existing library.

**A real build was run and finished successfully** (EAS build `6dea6ef7-31b5-4476-af01-953e16e42671`, SDK 57, built from commit `3b0034c` — confirmed via `eas build:view`'s recorded `gitCommitHash`, so this is verifiably the current code, not a stale build claimed to be current):

- Install page / QR code: https://expo.dev/accounts/singhankit001/projects/premium-gallery-app/builds/6dea6ef7-31b5-4476-af01-953e16e42671
- Direct `.apk` artifact: https://expo.dev/artifacts/eas/t8mLGPBRHrKYqR5hAubvyu_Qfic7Cvo1xQT_gCa2A1s.apk

Scan the QR on the install page from an Android device, or download the `.apk` directly and sideload it (enable "install from unknown sources" if prompted). See `DEVICE_QA_CHECKLIST.md` for a step-by-step manual test script to run against this exact build.

Two earlier builds (`1563a22a-4c39-4b88-ad57-6f47fbe49fd9`, `896699bb-d33d-43a8-bacc-e1f693d82239`) also finished successfully during earlier passes but predate the download fix above — use the build linked here, not those.

## Assumptions

- No real backend was provided or implied by the assignment brief, so authentication is a local mock system with a documented seed account, not a gap.
- "Search" is scoped to the images already paginated into the client, since the Picsum API offers no server-side author search to page against.
- Location autocomplete is scoped to India per the original brief.
- `limit=50` (vs. the brief's `limit=30`) was an explicit, owner-approved change, not a compliance drift — see `ASSIGNMENT_COMPLIANCE.md`.

## Known Limitations

- **No end-to-end device/UI-automation test coverage** — the automated suite covers business logic and AsyncStorage-backed persistence round-trips (see [Testing](#testing)); taps/gestures/navigation were verified manually via simulator screenshots during development, not by an automated UI test runner in this repository. The development sandbox this was built in has no `adb`, no Android emulator, and no touch-automation tool (Maestro/Detox/Appium/idb) installed — a real device is required to close this gap. `DEVICE_QA_CHECKLIST.md` in this repo is a step-by-step manual script for exactly that.
- **Search does not query the remote catalog** — it filters only the pages already loaded, by design (see [Search & Filtering](#search--filtering)); a user could fail to find an author who exists on a later, unfetched page.
- **Android package id is Expo's placeholder** (`com.anonymous.premiumgalleryapp`) — fine for an internal/preview APK, but should be renamed to a real reverse-domain identifier before any Play Store submission.
- **No offline queueing** — actions performed with no network (e.g. loading a new gallery page) fail with a retry option rather than being queued for later.
- **Mock auth has no password recovery flow** — not implemented, since there's no real backend/email service to back one.
- **"System" theme mode's live-OS-switch behavior is unverified on a physical device** — `ThemeProvider` derives `isDark` from React Native's own `useColorScheme()`, which is reactive (subscribed to `Appearance` change events, not a one-time read), so flipping the OS-wide light/dark setting while the app is open should retheme it live without a restart. This is standard React Native behavior, not custom code, but hasn't been physically confirmed on a device in this pass.

## What I Would Improve

- Add a lightweight E2E layer (Detox or Maestro) to cover the tap/gesture/navigation paths the current unit tests intentionally don't reach.
- Move the mock auth system onto a real backend (or a lightweight BaaS) if this ever needed multi-device sessions.
- Add a proper image detail cache (e.g. persisted TanStack Query cache) so previously-viewed artwork remains available fully offline, not just re-fetchable.
- Rename the Android application id off Expo's `com.anonymous.*` placeholder before any store submission.
- Add optimistic-UI rollback and a visible retry affordance for a failed favorite-toggle or profile update under a dropped connection.
