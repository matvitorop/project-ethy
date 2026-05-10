## [2026-05-10] Refactoring & UI/UX Overhaul

### Added
- **Framer Motion** for smooth animations and transitions.
- **UI Component Library**: Generic components in `src/components/ui` (`Button`, `Card`, `Badge`, `UserLink`, `Skeleton`).
- **UserLink Component**: Reusable component for clickable usernames throughout the app.
- **Page Transitions**: Smooth entry/exit animations for all routes.

### Changed
- **Directory Structure**: Moved all page components to `src/pages/` for better separation of concerns.
- **AppLayout**: Modern "glassmorphism" style navbar with improved navigation.
- **PublicLayout**: Polished landing and auth layouts.
- **Design Overhaul**: Refined colors, shadows, and spacing across `HomePage`, `RequestsListPage`, and `StatsPage`.
- **RequestCard**: Modernized card design with status badges and hover effects.

### Technical
- Standardized UI components for better maintainability.
- Extracted business logic from `RequestsListPage` and `StatsPage` into cleaner component structures.
- Improved mobile responsiveness of main layouts.
