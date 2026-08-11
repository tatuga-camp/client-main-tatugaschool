# Student Work status tabs — design

**Date:** 2026-08-11
**Component:** `components/subject/ClassStudentWork.tsx` (teacher app, `clients/client-main-tatugaschool`)
**Status:** Approved by user (brainstorming session)

## Goal

Let teachers filter the student list on an assignment by submission status so they can click straight into "Wait to review" and grade newly submitted work without scanning the whole roster.

## Background

`ClassStudentWork` renders a student table (search box, select-all + per-row checkboxes for bulk grading, status badge, score, view-work button) beside a detail panel. Students are fetched via `useGetStudentOnAssignments` with a 5-second `refetchInterval`. Each `StudentOnAssignment` has `status: "PENDDING" | "SUBMITTED" | "REVIEWD" | "IMPROVED"` (spellings are as defined in `interfaces/StudentOnAssignment.ts`). `StatusAssignmentButton` renders these as badges labeled via `studentWorkDataLanguage` keys `noWork`, `waitForReview`, `reviewed`, `improve` (en/th).

## Decisions made during brainstorming

- `IMPROVED` gets its **own tab** (not merged into another bucket).
- There **is an All tab**, and it is the **default**, so current behavior is preserved until a teacher picks a tab.
- Approach: **client-side, state-only tabs** (no URL sync, no grouped sections, no backend changes).

## Design

### UI

A tab bar sits inside the student-list section, between the search/download header and the table. Five tabs in order:

| Tab | Status value | Label source (en / th) |
|---|---|---|
| All | — | new key `all` ("All" / "ทั้งหมด") |
| Wait to review | `SUBMITTED` | existing `waitForReview` |
| Reviewed | `REVIEWD` | existing `reviewed` |
| Need Improvement | `IMPROVED` | existing `improve` |
| No work | `PENDDING` | existing `noWork` |

- Each tab shows a live count of **assigned** students in that bucket, e.g. `Wait to review (4)`. Counts are computed from `studentOnAssignments.data` (so they update with the existing 5s refetch) and **ignore the search box** — they always reflect the whole roster.
- Styling follows the project theme tokens: active tab `text-primary-color` with a `border-primary-color` bottom border; inactive `text-gray-500`. Same visual family as the existing Works/Comments tabs in this file.
- The bar is horizontally scrollable on narrow screens (`overflow-x-auto`, `whitespace-nowrap` / no wrap) so mobile layouts are not broken.
- While student data is loading, the tab bar renders with the All tab active and no counts shown; the existing skeleton rows continue to show.

### State and filtering

- One new state in `ClassStudentWork`: `const [selectStatusTab, setSelectStatusTab] = useState<"ALL" | StudentAssignmentStatus>("ALL")`.
- Filtering is applied at render time in the existing table-body chain:
  `studentData.filter(d => d.isAssigned).filter(byTab).sort(byNumber)` where `byTab` passes everything when the tab is `ALL`, otherwise matches `student.status`.
- **Search composes with AND**: the existing name search (which rewrites `studentData`) and the tab filter both apply; searching within a tab shows only matching students in that status.

### Interactions with existing features

- **Select-all checkbox** is scoped to the currently *visible* rows (after tab + search filtering), instead of the current behavior of selecting every student in state. This makes "open Wait to review → select all → bulk grade" work as expected.
- **Switching tabs clears all selections.** Rationale: individually-checked rows hidden by the new tab could otherwise silently receive bulk grades.
- **Deep-link** (`?studentOnAssignmentId=`) is unaffected: it opens the student's detail panel regardless of active tab; the default All tab shows every row.
- **Detail panel** is untouched. When grading flips a student `SUBMITTED → REVIEWD`, the student drops out of the Wait to review tab on the next refetch — the intended "grade it and it leaves my queue" flow.
- **Empty tab state:** when a tab has no students, show a short centered message in the table area via a new language key `emptyStatusTab` (en "No students in this status" / th "ไม่มีนักเรียนในสถานะนี้").

### Scope

Files touched:

1. `components/subject/ClassStudentWork.tsx` — tab bar (small local subcomponent in the same file is fine), tab state, render-time filter, select-all scoping, tab-switch selection clearing, empty state.
2. `data/languages/classwork.ts` — two new keys on `studentWorkDataLanguage`: `all`, `emptyStatusTab` (en + th).

No backend, routing, interface, or new-component-file changes.

### Error handling

No new error surface: filtering is pure computation over already-fetched data. Existing loading skeletons and error toasts are unchanged.

### Verification

- `npx tsc --noEmit` and `npm run build` in `clients/client-main-tatugaschool` (lint is broken on Next 16 per project instructions).
- Manual QA checklist:
  - Tab counts match the badges shown in the rows, and update after grading (≤5s).
  - Search inside a tab narrows to matching students in that status only; counts stay roster-wide.
  - Select-all inside Wait to review selects only visible rows; bulk grade applies to them; graded students leave the tab.
  - Switching tabs clears selections.
  - Thai labels render on all five tabs and the empty state.
  - Tab bar scrolls horizontally on a narrow viewport.
