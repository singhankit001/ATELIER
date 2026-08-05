# Repository Pattern

## Overview
The `src/core/api` and feature-level `repositories/` isolate the application from direct network reliance. 

## Why a Repository?
If the underlying API changes from REST to GraphQL, or from Axios to fetch, the rest of the application should remain completely untouched.

### Implementation
1. **Network Client**: Axios is configured in the core with interceptors for auth tokens.
2. **Repository**: `authRepository.ts` or `galleryRepository.ts` exposes strictly typed promises (e.g., `getFeed(page): Promise<Artwork[]>`).
3. **Consumer**: The Zustand store or TanStack query calls the Repository.

This chain guarantees that bad data never leaks into the global state, as all responses are validated (often via Zod) within the repository before being returned to the stores.






