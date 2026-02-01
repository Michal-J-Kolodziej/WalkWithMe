# Location Feature Bug Report

## Issues Found

1.  **Missing Distance Display**:
    - **Description**: User cards in "Discover" and "Friends" do not show the calculated distance (e.g., "500m away").
    - **Impact**: Core feature (proximity discovery) is not visible to the user.
    - **Likely Cause**: Data syncing issue or `currentLocation` prop not being passed/updated correctly in components.

2.  **Missing "Updated" Status**:
    - **Description**: The profile page does not show the "Updated X mins ago" timestamp next to the location as specified in the plan.
    - **Impact**: User cannot verify if their location is being actively tracked.
    - **Likely Cause**: `geo_location` data might be missing in the user query response or not rendering conditionally.

3.  **Missing Translations in Settings**:
    - **Description**: Settings page displays raw translation keys (e.g., `settings.locationServices`, `settings.shareLocationDesc`) instead of actual text.
    - **Impact**: Degrades UI quality.
    - **Likely Cause**: Missing keys in `public/locales` JSON files.

4.  **Hydration Mismatch**:
    - **Description**: Console logs show React hydration errors.
    - **Impact**: Potential UI flickering or instability.
