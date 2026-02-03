# Location Feature Implementation Plan

> **Status**: Planning Phase
> **Last Updated**: 2026-01-31

## Overview

This feature enables users to share their real-time or most recent location to allow others to see the distance between them. This promotes physical meetups and "walking partner" discovery.

## core Goals

1.  **Location Tracking**: Capture user's latitude/longitude when the app is active.
2.  **Distance Calculation**: Display distance (in meters/kilometers) to other users on profiles and cards.
3.  **Privacy Controls**: Allow users to toggle location sharing (on/off) and potentially limit visibility.
4.  **Efficiency**: Minimize battery usage and database writes.

---

## 1. Database Schema Design (Convex)

We need to store geospatial data on the user profile.

### Modified `users` Table

Add a `location` object field to the `users` table in `schema.ts`.

```typescript
// convex/schema.ts
users: defineTable({
  // ... existing fields
  location: v.optional(
    v.object({
      latitude: v.number(),
      longitude: v.number(),
      updatedAt: v.number(), // Timestamp for freshness
    }),
  ),
  isLocationEnabled: v.optional(v.boolean()), // Master toggle for privacy
})
// We might want an index for geospatial queries later,
// but for now, we'll rely on client-side sorting/filtering for small datasets
// or basic bounding box queries if needed.
```

---

## 2. Backend Architecture

### Mutations

**`updateLocation`**

- **File**: `convex/users.ts`
- **Args**: `{ latitude: number, longitude: number }`
- **Logic**:
  - Check if `isLocationEnabled` is true for the user.
  - Update `location.latitude`, `location.longitude`, and `location.updatedAt`.
  - Rate limiting: Ensure this isn't called more than once every ~30-60 seconds per client to save DB writes.

**`toggleLocationVisibility`**

- **File**: `convex/users.ts`
- **Args**: `{ enabled: boolean }`
- **Logic**: Updates `isLocationEnabled`.

### Queries

**`getNearbyUsers` (Future Optimization)**

- Currently, `api.users.list` (Discover) fetches all/recent users.
- We can continue fetching users and calculate distance client-side for the MVP.
- **Privacy Check**: When returning user objects, ensure `location` is `null` if `isLocationEnabled` is false.

---

## 3. Frontend Architecture

### New Context/Hook: `useLocationTracker`

A dedicated hook to manage Geolocation API interactions.

- **Responsibilities**:
  - Request permissions (`navigator.geolocation.getCurrentPosition`).
  - Watch position (`navigator.geolocation.watchPosition`).
  - Debounce updates to the backend (throttle to e.g., 1 minute or significant distance change).
  - Handle errors (permission denied, GPS unavailable).
  - Expose current user coordinates to the app state.

### Distance Calculation Helper

`src/lib/geo.ts`

- **Function**: `calculateDistance(lat1, lon1, lat2, lon2): { distance: number, unit: 'm' | 'km' }`
- **Algorithm**: Haversine formula.
- **Formatter**: Returns strings like "500m", "1.2km".

### Components Updates

**1. Settings Page (`settings.tsx`)**

- Add "Location Services" section.
- Toggle switch: "Share my location".
- Status indicator: "Active" / "Permission Denied".

**2. User Card (`UserCard.tsx` / Discover)**

- Add distance badge (e.g., `<MapPin /> 2.5 km away`).
- Logic: If current user has location AND target user has location, show distance. Else show nothing or "Location hidden".

**3. User Profile (`ProfilePage.tsx` / `UserProfile.tsx`)**

- Prominent distance display.
- "Last updated X minutes ago" to imply freshness.

**4. Friends List (`FriendCard.tsx`)**

- Show distance to friends (sorting friends by distance could be a nice enhancement).

---

## 4. Privacy & Safety Considerations

- **Opt-in by Default**: Location sharing should initially be OFF until the user enables it in onboarding or settings.
- **Stale Data**: Automatically hide or mark location as "offline" if not updated in > 24 hours.
- **Permission Denial**: Gracefully handle cases where browser permission is blocked.
- **Visibility Scope**:
  - _MVP_: Public (if enabled).
  - _V2_: "Friends Only" vs "Public" visibility toggle.

---

## 5. Implementation Steps

### Phase 1: Foundation (Backend)

- [ ] Modify `schema.ts` to add `location` and `isLocationEnabled`.
- [ ] Create `updateLocation` mutation in `users.ts`.
- [ ] Create `toggleLocationVisibility` mutation in `users.ts`.
- [ ] Update `users.current` and lists to respect privacy (filtering location data).

### Phase 2: Logic (Frontend)

- [ ] Create `src/lib/geo.ts` with Haversine formula.
- [ ] Create `useLocationTracker` hook.
  - Implement `watchPosition`.
  - Implement throttling/debouncing.
  - Connect to `updateLocation` mutation.

### Phase 3: UI Integration

- [ ] Update **Settings Page**: Add toggle for Location Sharing.
- [ ] Update **User Card**: Check for location data and display distance.
- [ ] Update **Profile Page**: Display distance and freshness.
- [ ] Update **Friend Card**: Display distance.

### Phase 4: Verification

- [ ] Test with two different browsers/devices.
- [ ] Verify privacy toggle halts updates and hides existing location.
- [ ] Verify distance accuracy.

---

## 6. Task Tracking (Bugs/Issues)

_(This section will be populated as implementation proceeds)_

- [ ]
