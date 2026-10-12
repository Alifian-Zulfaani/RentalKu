---
name: studio-backend
description: Maintain Studio Senja's Express and SQLite booking API, studio schedule, portfolio, and backward-compatible photographer features with clean validation and tests.
---

# Studio Senja backend

Use this skill when changing `booking-backend`.

## Current product mode

- Studio-first MVP: public availability and booking omit `pro`. `studio_working_hours`, `studio_blocks`, and all non-cancelled tenant bookings determine a studio slot. Portfolio records are tenant-scoped and public output includes active records only.
- Existing photographer tables, endpoints, and bookings remain for later use. Keep database migrations additive and existing data intact. `booking_scope` distinguishes studio from photographer bookings.

## Working conventions

- Routes/controllers handle HTTP and validation; scheduling rules belong in `src/services/schedulingService.js`; SQLite schema and additive migrations belong in `src/config/database.js`.
- Scope every admin query by authenticated tenant. Check role before studio-only writes. Validate dates, times, ownership, and image URLs; return consistent `{ data }`, `{ message }`, and field-aware errors.
- Keep conflicting booking checks inside a transaction. A cancellation/reactivation must not create a double-booked slot.
- Add tests for studio availability, blocked dates, booking conflicts, portfolio visibility, and legacy photographer behavior. Run `npm test`; update `docs/api-contract.md` and README for endpoint changes.
