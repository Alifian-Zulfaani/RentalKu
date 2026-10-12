---
name: studio-frontend
description: Maintain Studio Senja's Vue frontend with consistent public/admin layouts, responsive styling, accessible booking UX, and a studio-first MVP that preserves future photographer pages.
---

# Studio Senja frontend

Use this skill when changing `booking-frontend`.

## Current product mode

- `src/config/features.js` controls the photographer feature. The MVP uses one studio calendar and studio services. Keep the photographer views and components available for later activation; do not delete them while implementing studio changes.
- Public entry: reservation first, then portfolio. `/tentang` and `/portofolio` are separate studio pages. Confirm before POST; successful POST navigates to the receipt page.
- Company admin shows overview, reservations, studio availability, portfolio, and settings. Photographer and service management routes are retained but hidden in MVP.

## Working conventions

- Put page-level components in `src/views/public` or `src/views/admin`, reusable UI in `src/components/public`, `admin`, or `shared`, API requests in services/stores, and feature flags in `src/config`.
- Reuse existing design tokens in `style.css` and `admin.css`; check light and dark themes and mobile/tablet/desktop layouts. Use semantic labels, keyboard-friendly dialogs, loading/empty/error states, and server error feedback.
- Keep calendar availability server-driven. Never mark a date bookable based solely on frontend state. The studio booking flow omits `pro`.
- After changes run `npm run build`, review browser behavior, and update README when behavior or routes change.
