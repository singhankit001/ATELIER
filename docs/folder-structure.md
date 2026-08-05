# Folder Structure

This repository is strictly organized to reflect its 5-Layer architectural philosophy.

```
src/
├── app/                  # Expo Router / Navigation Entry (or App.tsx equivalent)
├── core/                 # Infrastructure Layer
│   ├── theme/            # Design tokens, typography rules, color palettes
│   ├── utils/            # General helpers, validation utilities
│   └── api/              # Base axios interceptors and networking config
├── design/               # Design Primitive Layer
│   ├── components/       # <Button>, <Typography>, <TextField>
│   └── layouts/          # <Spacer>, <SafeArea>
├── experience/           # Motion & Interaction Layer
│   ├── gestures/         # Pan, Pinch, Swipe hook logic
│   ├── haptics/          # Tactile feedback orchestrator
│   └── scene/            # Global overlays (Portal, MuseumBackground)
├── features/             # Feature & Domain Assembly Layer
│   ├── auth/             # Login, Register, Auth Store, Auth Repository
│   ├── gallery/          # Grid, Viewer, Search, Store, API queries
│   ├── favorites/        # Offline-sync Favorites Store
│   └── profile/          # Theme switching, Avatar, Profile config
└── navigation/           # Core routing config
```

### Why this structure?
By grouping domains inside `features/` (i.e. Vertical Slicing), a developer working on Authentication does not need to hunt across a massive global `screens/` or `services/` folder. All logic pertaining to Authentication lives entirely within `src/features/auth`.
