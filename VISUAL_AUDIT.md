# Visual Audit Report - 2026-02-07

## Summary

Initial audit started.

## Issues Log

| ID  | Page/Component    | Viewport | Severity | Issue Description                                     | Suggested Fix                                                | Status |
| --- | ----------------- | -------- | -------- | ----------------------------------------------------- | ------------------------------------------------------------ | ------ |
| 01  | Dashboard/Stats   | All      | Minor    | "Czas Spacerów" shows "NaNm"                          | Fix `formatDuration` to handle NaN/null or check data source | Fixed  |
| 02  | Dashboard/DogCard | All      | Minor    | Dog age shows "33 rok" (likely incorrect calculation) | Check age calculation logic in `DogCard`                     | Fixed  |
| 03  | Dashboard/Weather | Mobile   | Cosmetic | Hourly forecast labels are cramped/misaligned         | Adjust padding or font size for mobile                       | Fixed  |
| 04  | Dashboard/Mobile  | Mobile   | Pass     | Mobile menu works, layout stacks correctly            | N/A                                                          | Closed |
| 05  | Profile/Bio       | All      | Cosmetic | User Bio not visible on Profile page                  | Add `user.bio` rendering below role badge                    | Fixed  |
| 06  | Settings/Age      | All      | Minor    | Age input potentially empty if not set                | N/A (Feature works as intended for unset data)               | Closed |
