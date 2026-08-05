# Docs — Assignment Mapping

Detailed feature mapping of ATELIER components against design goals:

### 1. Gallery Dataset Compliance
- Source: `https://picsum.photos/v2/list?page=1&limit=30`
- Service: `src/features/gallery/services/galleryService.ts`
- Controller: `src/features/gallery/controllers/useGalleryController.ts`

### 2. Spatial Parallax Engine
- Hook: `src/experience/parallax/useScrollParallax.ts`
- Calculation: 3D perspective tilt (`rotateX`), scale interpolation, spatial depth opacity.

### 3. Dynamic Design Tokens
- Provider: `src/core/theme/ThemeProvider.tsx`
- Tokens: `src/core/theme/tokens.ts`

### 4. Location Autocomplete Modal
- Component: `src/design/components/LocationAutocomplete.tsx`
- Backend: OpenStreetMap Nominatim REST API with `countrycodes=in` parameter.
