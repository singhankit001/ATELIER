# State Management Flow

## The Zustand Ecosystem

We utilize `Zustand` due to its minimal boilerplate and robust selector support, completely decoupling state from the React component tree.

### Core Stores
- **`useAuthStore`**: Manages session state, handles the portal entry conditions, and persists credentials.
- **`useFavoritesStore`**: Manages offline-sync for bookmarked artworks. Highly reactive.
- **`useGalleryStore`** (or React Query integration): Manages infinite pagination, search states, and payload caching.

## The Architecture Rule
React components **do not** write complex update logic. They dispatch.
**BAD**:
```tsx
const login = async () => {
   setLoading(true);
   const res = await api.post('/login');
   setUser(res.data);
}
```

**GOOD**:
```tsx
const login = useAuthStore(state => state.login);
// The component simply fires login(email, password)
```
This ensures that any component in the app can trigger a login sequence without duplicating network logic.
