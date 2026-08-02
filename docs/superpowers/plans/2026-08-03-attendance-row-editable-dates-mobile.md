# AttendanceChecker Editable Dates + Mobile Update View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let teachers edit an attendance row's start/end dates in update mode, and make the update view usable on phones by turning the modal into one naturally scrolling column below `md`.

**Architecture:** All changes live in `components/subject/AttendanceChecker.tsx`. Part 1 wires the already-supported `startDate`/`endDate` fields through the update UI and payload (service type and backend PATCH DTO already accept them). Part 2 is a responsive-class-only layout change: below `md` the modal's inner column scrolls, the title row and footer become sticky, and inner scroll traps are removed; `md:`-prefixed variants preserve the exact current desktop behavior.

**Tech Stack:** Next.js 16 (pages router), React 18, TypeScript, Tailwind v3, @tanstack/react-query, primereact.

**Spec:** `docs/superpowers/specs/2026-08-03-attendance-row-editable-dates-mobile-design.md`

## Global Constraints

- Work inside `clients/client-main-tatugaschool` — **that directory is the git repo** (the monorepo root is NOT a git repo). All `git` commands run from there.
- Do all work on branch `attendance-editable-dates` (created in Task 1). Do not merge.
- Styling must use the theme tokens from `tailwind.config.ts` (`primary-color`, `background-color`, `icon-color`, etc.) — never new hex values. This plan only adds stock Tailwind layout/positioning classes plus `bg-white`, which the file already uses.
- `npm run lint` is broken (Next 16 removed `next lint`). Verification is `npx tsc --noEmit` and `npm run build` only.
- There is no unit-test runner in this repo. Each task's test cycle = typecheck (+ build where stated) + the headless visual QA in Task 3.
- End every commit message with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- Commands below are PowerShell (Windows). `&&` does not work in Windows PowerShell 5.1 — run commands separately or with `;`.

---

### Task 1: Editable start/end dates in update mode + update payload

**Files:**
- Modify: `components/subject/AttendanceChecker.tsx` (update branch of `handleSummitForm`, ~line 214; update-mode date inputs, ~lines 600–627)

**Interfaces:**
- Consumes: `useUpdateRowAttendance` mutation (already imported); its body type `UpdateAttendanceRowBody` in `services/attendance-row.ts` already has optional `startDate?: string; endDate?: string` — no service changes.
- Produces: update mode now sends `startDate`/`endDate` as ISO strings and the two date inputs are controlled/editable. Task 3's QA page relies on update mode rendering these inputs without `disabled`.

- [ ] **Step 1: Create the working branch**

```powershell
git -C clients/client-main-tatugaschool checkout main
git -C clients/client-main-tatugaschool checkout -b attendance-editable-dates
```

Expected: `Switched to a new branch 'attendance-editable-dates'`

- [ ] **Step 2: Add the date guard and payload fields to the update branch of `handleSummitForm`**

In `components/subject/AttendanceChecker.tsx`, find this code (~line 214):

```tsx
      if (selectAttendanceRow) {
        setLoading(true);

        const update = await updateAttendanceRow.mutateAsync({
          query: {
            attendanceRowId: selectAttendanceRow.id,
          },
          body: {
            note: attendanceData.note,
```

Replace with:

```tsx
      if (selectAttendanceRow) {
        if (!attendanceData.startDate || !attendanceData.endDate) {
          throw new Error("Start Date and End Date is required");
        }
        setLoading(true);

        const update = await updateAttendanceRow.mutateAsync({
          query: {
            attendanceRowId: selectAttendanceRow.id,
          },
          body: {
            startDate: new Date(attendanceData.startDate).toISOString(),
            endDate: new Date(attendanceData.endDate).toISOString(),
            note: attendanceData.note,
```

(The guard message intentionally matches the create branch's existing error text. The thrown error is caught by the function's existing `catch`, which shows the Swal dialog.)

- [ ] **Step 3: Make the update-mode start-date input editable**

In the same file, in the update-mode branch of the header (the `) : (` branch after `{!selectAttendanceRow ? (`, ~line 598), find:

```tsx
                      <BrandInput
                        required
                        disabled
                        value={attendanceData.startDate ?? ""}
                        type="datetime-local"
                      />
```

Replace with (same handler as create mode — changing start auto-sets end to start + 1 hour via the file's existing `addOneHour` helper):

```tsx
                      <BrandInput
                        required
                        value={attendanceData.startDate ?? ""}
                        onChange={(e) =>
                          setAttendanceData((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                            endDate: addOneHour(e.target.value),
                          }))
                        }
                        type="datetime-local"
                      />
```

- [ ] **Step 4: Make the update-mode end-date input editable**

A few lines below, find:

```tsx
                      <BrandInput
                        required
                        disabled
                        value={attendanceData.endDate ?? ""}
                        type="datetime-local"
                      />
```

Replace with:

```tsx
                      <BrandInput
                        required
                        value={attendanceData.endDate ?? ""}
                        onChange={(e) =>
                          setAttendanceData((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        type="datetime-local"
                      />
```

- [ ] **Step 5: Typecheck**

```powershell
Set-Location clients/client-main-tatugaschool
npx tsc --noEmit
```

Expected: exit code 0, no output. (If `startDate`/`endDate` were rejected by the body type, the service layer changed — stop and re-read `services/attendance-row.ts`.)

- [ ] **Step 6: Commit**

```powershell
git add components/subject/AttendanceChecker.tsx
git commit -m "feat: allow editing start/end dates when updating an attendance row

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: One-natural-scroll mobile layout for the modal

**Files:**
- Modify: `components/subject/AttendanceChecker.tsx` (five className edits, no DOM restructuring)

**Interfaces:**
- Consumes: the JSX structure as it exists after Task 1 (Task 1 touches different lines; no overlap).
- Produces: below `md` the inner column is the scroll container, title row is `sticky top-0 z-50`, footer is `sticky bottom-0 z-50`; at `md+` all current behavior is preserved via `md:` variants. Task 3 verifies this visually.

All edits are in the non-QR-code branch of the return (the big `<div className="ac-shell ...">`).

- [ ] **Step 1: Make the inner column the mobile scroll container**

Find (~line 425):

```tsx
          <div className="relative flex h-full flex-col">
```

Replace with:

```tsx
          <div className="relative flex h-full flex-col overflow-y-auto md:overflow-hidden">
```

- [ ] **Step 2: Make the title row sticky on mobile**

Find (~line 428, the first child of the `ac-header` div):

```tsx
              <div className="flex items-start justify-between gap-3">
```

Replace with:

```tsx
              <div className="sticky top-0 z-50 -mx-4 flex items-start justify-between gap-3 bg-white px-4 py-2 sm:-mx-6 sm:px-6 md:static md:z-auto md:mx-0 md:bg-transparent md:p-0">
```

(The negative margins + matching padding make the sticky bar span the header's full width — the `ac-header` has `px-4 sm:px-6 md:px-8`; at `md+` everything resets to the original layout. `z-50` clears the desktop table's sticky cells, which use up to `z-40`, and applies only on mobile where the table is hidden anyway.)

- [ ] **Step 3: Make the footer sticky on mobile**

Find (~line 920):

```tsx
            <div
              className="ac-footer flex-none border-t border-dashed border-gray-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 md:px-8 md:py-4"
```

Replace with:

```tsx
            <div
              className="ac-footer sticky bottom-0 z-50 flex-none border-t border-dashed border-gray-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 md:static md:z-auto md:px-8 md:py-4"
```

- [ ] **Step 4: Free the main region's height on mobile**

Find (~line 753):

```tsx
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3 sm:px-6 md:px-8 md:py-4">
```

Replace with:

```tsx
            <div className="flex flex-col px-3 py-3 sm:px-6 md:min-h-0 md:flex-1 md:overflow-hidden md:px-8 md:py-4">
```

- [ ] **Step 5: Remove the mobile card list's inner scroll trap**

Find (~line 776):

```tsx
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-1 md:hidden">
```

Replace with:

```tsx
                  <div className="space-y-3 pb-1 md:hidden">
```

- [ ] **Step 6: Typecheck and build**

```powershell
Set-Location clients/client-main-tatugaschool
npx tsc --noEmit
npm run build
```

Expected: typecheck silent; build ends with `✓ Compiled successfully` / route table, exit 0.

- [ ] **Step 7: Commit**

```powershell
git add components/subject/AttendanceChecker.tsx
git commit -m "fix: make attendance update view scroll naturally on mobile

Below md the modal column scrolls as one page with sticky title row and
sticky Update/Delete footer, so the QR settings panel can no longer push
the footer off-screen. Desktop layout unchanged via md: variants.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Headless visual QA (then remove the QA page)

**Files:**
- Create (temporary, never committed): `pages/dev-attendance-qa.tsx`
- Screenshots go to the session scratchpad directory.

**Interfaces:**
- Consumes: update mode of `AttendanceChecker` as produced by Tasks 1–2; the app's `_app.tsx` provides the QueryClientProvider the component's hooks need.
- Produces: pass/fail verdict with screenshots. Known limitation: the XHR stub means `studentOnSubjects.data` never resolves, so the date inputs render **empty** (the prefill effect is gated on that data) and the student list stays in loading state. This QA validates layout and reachability, not prefill.

- [ ] **Step 1: Create the QA page**

Create `pages/dev-attendance-qa.tsx`:

```tsx
import dynamic from "next/dynamic";
import React, { useRef } from "react";
import { Toast } from "primereact/toast";

if (typeof window !== "undefined") {
  const fakePayload = btoa(JSON.stringify({ exp: 9999999999 }));
  document.cookie = `access_token=h.${fakePayload}.s; path=/`;
  document.cookie = `refresh_token=h.${fakePayload}.s; path=/`;
  // Stub XHR so axios requests hang forever instead of 401-redirecting
  // to /auth/sign-in via the interceptor in services/api-service.ts.
  class XHRStub {
    open() {}
    send() {}
    setRequestHeader() {}
    addEventListener() {}
    abort() {}
    upload = { addEventListener() {} };
  }
  // @ts-ignore
  window.XMLHttpRequest = XHRStub;
}

const AttendanceChecker = dynamic(
  () => import("../components/subject/AttendanceChecker"),
  { ssr: false },
);

// Throwaway mock; `any` because this page is deleted before final tsc/build.
const row: any = {
  id: "64b000000000000000000001",
  attendanceTableId: "64b000000000000000000002",
  startDate: "2026-08-03T01:00:00.000Z",
  endDate: "2026-08-03T02:00:00.000Z",
  note: "",
  type: "SCAN",
  expireAt: "2026-08-03T03:00:00.000Z",
  allowScanAt: "2026-08-03T01:00:00.000Z",
  isAllowScanManyTime: true,
  attendances: [],
};

export default function DevAttendanceQA() {
  const toastRef = useRef<Toast>(null);
  return (
    <AttendanceChecker
      subjectId="64b000000000000000000003"
      onClose={() => {}}
      toast={toastRef}
      selectAttendanceRow={row}
    />
  );
}
```

(`type: "SCAN"` is deliberate — it renders the QR-settings panel, the worst-case header height that caused the off-screen footer.)

- [ ] **Step 2: Ensure the dev server is running on port 8181**

```powershell
try { (Invoke-WebRequest http://localhost:8181 -UseBasicParsing -TimeoutSec 5).StatusCode } catch { "not running" }
```

If it prints `not running`, start it in the background from `clients/client-main-tatugaschool`: `npm run dev` (leave it running; first compile of the QA page happens on first request and can take ~30s).

- [ ] **Step 3: Screenshot mobile (390 CSS px) and desktop (1200 CSS px)**

Chrome adds 16px window chrome, so window width = target + 16. Replace `<SCRATCHPAD>` with the session scratchpad path.

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --screenshot="<SCRATCHPAD>\ac-mobile-top.png" --window-size=406,860 --virtual-time-budget=30000 "http://localhost:8181/dev-attendance-qa"
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --screenshot="<SCRATCHPAD>\ac-desktop.png" --window-size=1216,816 --virtual-time-budget=30000 "http://localhost:8181/dev-attendance-qa"
```

Expected: both PNG files exist and are non-trivial size (> 20 KB).

- [ ] **Step 4: Screenshot the mobile page scrolled to the bottom**

Scrolling can't be passed as a Chrome flag; verify reachability by scrolling in-page. Temporarily add this effect inside `DevAttendanceQA` (before the `return`), take the screenshot, then remove it — or use the CDP approach from the repo notes if already set up:

```tsx
  React.useEffect(() => {
    const t = setTimeout(() => {
      document
        .querySelector(".ac-footer")
        ?.scrollIntoView({ block: "end" });
    }, 3000);
    return () => clearTimeout(t);
  }, []);
```

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --screenshot="<SCRATCHPAD>\ac-mobile-bottom.png" --window-size=406,860 --virtual-time-budget=30000 "http://localhost:8181/dev-attendance-qa"
```

- [ ] **Step 5: Inspect the screenshots (view the PNG files) against these criteria**

1. `ac-mobile-top.png`: title row visible at top; start/end date inputs present and NOT greyed out (enabled inputs have white background; disabled style is grey `bg-gray-50`); sticky footer with Update + Delete buttons visible at the bottom edge of the viewport.
2. `ac-mobile-bottom.png`: page scrolled — QR settings panel and/or student-list area visible with the footer still pinned at the bottom; nothing clipped with no way to reach it.
3. `ac-desktop.png`: layout matches the pre-change desktop design — fixed header with dates + QR panel, table area, footer at bottom of the modal (not of the page), no sticky-bar artifacts.

If any criterion fails: stop, fix the classes from Task 2, re-run Step 3/4. Do not proceed with a failing screenshot.

- [ ] **Step 6: Delete the QA page and re-verify cleanliness**

```powershell
Remove-Item pages/dev-attendance-qa.tsx
npx tsc --noEmit
git status --short
```

Expected: typecheck silent; `git status` shows no uncommitted changes to tracked files (the QA page was never added).

---

## Self-Review Notes

- Spec coverage: §1 editable inputs → Task 1 Steps 3–4; §2 payload + guard → Task 1 Step 2; §3 all five layout bullets → Task 2 Steps 1–5 (one step per bullet); §Testing → Task 1 Step 5, Task 2 Step 6, Task 3.
- Prefill of dates in update mode is existing behavior (the `useEffect` gated on `studentOnSubjects.data`) and is intentionally untouched; QA limitation documented in Task 3.
- Type consistency: `attendanceData.startDate/endDate` are `string | undefined` — guarded before `new Date(...)` in Task 1 Step 2, matching the create branch's pattern.
