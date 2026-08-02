# AttendanceChecker: editable dates on update + mobile-friendly update view

**Date:** 2026-08-03
**File under change:** `components/subject/AttendanceChecker.tsx` (only file changed)

## Problem

When `AttendanceChecker` receives `selectAttendanceRow` (update mode):

1. The start/end date inputs are rendered `disabled` with no `onChange`, and
   `handleSummitForm`'s update branch never sends `startDate`/`endDate` — so a
   teacher cannot change an attendance row's dates, even though the client
   service type (`UpdateAttendanceRowBody` in `services/attendance-row.ts`) and
   the backend PATCH DTO (`patch-attendance.dto.ts`, `@IsDateString()` optional
   fields) already accept both.
2. On phones, the modal is a fixed `h-dvh` box with `overflow-hidden` on every
   container. The update-mode header holds the title row, two stacked date
   fields, and — for SCAN rows — a QR-settings panel with three more stacked
   fields. That header is `flex-none`, so on small screens it crushes the
   student list to near-zero height and pushes the Update/Delete footer
   off-screen with no way to scroll to it. The existing short-viewport CSS fix
   applies only at `min-width: 768px`, so phones get no help.

## Design

### 1. Editable dates in update mode

- Remove `disabled` from both update-mode `BrandInput`s.
- Wire the same handlers as create mode: the start-date input sets `startDate`
  and auto-sets `endDate = addOneHour(value)`; the end-date input sets
  `endDate` alone (user-confirmed behavior: identical to create mode).
- Values remain prefilled from `selectAttendanceRow` by the existing
  `useEffect` (ISO → `datetime-local` via `convertToDateTimeLocalString`).

### 2. Update payload

In `handleSummitForm`'s update branch:

- Guard before any API call: if `attendanceData.startDate` or
  `attendanceData.endDate` is empty (a user can clear a `datetime-local`
  field), throw the same "Start Date and End Date is required" error used by
  the create branch, surfaced by the existing catch/Swal dialog.
- Add to the `updateAttendanceRow` body:
  `startDate: new Date(attendanceData.startDate).toISOString()` and
  `endDate: new Date(attendanceData.endDate).toISOString()`.
- No service, react-query, or backend changes.

### 3. Mobile layout: one natural scroll below `md`

Responsive-class changes only — no DOM restructuring:

- The inner flex column (`flex h-full flex-col`) becomes the mobile scroll
  container: `overflow-y-auto md:overflow-hidden`.
- The title row (heading + QR/note/close buttons) becomes `sticky top-0 z-50`
  with an opaque background on mobile, `md:static`, so Close is always
  reachable (`z-50` because the desktop table already uses sticky cells up to
  `z-40`; the mobile card list has no competing stacking contexts).
- The footer becomes `sticky bottom-0` on mobile, `md:static`, so
  Update/Delete are always reachable.
- The main region keeps `flex-1 min-h-0 overflow-hidden` as `md:`-prefixed
  variants only; on mobile it takes natural height.
- The mobile card list drops its own `overflow-y-auto`/`flex-1`; dates, QR
  settings, summary chips, and student cards scroll together as one page.
- Desktop (`md+`) behavior is unchanged, including the desktop table's
  internal scrolling and the existing short-viewport media query.

### Out of scope

- Unifying create/edit date-field JSX (rejected: the branches differ around
  the fields; extraction adds indirection for ~20 saved lines).
- Any change to create-mode behavior, services, or the backend.

## Error handling

Unchanged: failures reach the existing catch block and Swal error dialog. The
new empty-date guard reuses the create branch's error message.

## Testing / verification

- `npx tsc --noEmit` and `npm run build` in `clients/client-main-tatugaschool`
  (`npm run lint` is broken on Next 16 — do not use).
- Visual QA via the established headless-Chrome harness (temp page with fake
  JWT cookies and stubbed XHR, dev server on port 8181): screenshots at
  ~390px and ~768px widths confirming (a) date inputs are editable in update
  mode, (b) the whole update view scrolls on mobile, (c) the sticky footer's
  Update button is reachable with a SCAN row's QR panel present, (d) desktop
  layout is visually unchanged.
