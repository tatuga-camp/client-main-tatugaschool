# Student Work Status Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five status-filter tabs (All / Wait to review / Reviewed / Need Improvement / No work) with live counts above the student table in `ClassStudentWork.tsx`, so teachers can jump straight to ungraded submissions.

**Architecture:** Pure client-side filtering. The active tab is one `useState` in `ClassStudentWork`; the filter is applied at render time to the already-fetched `studentData` array (refetched every 5s by react-query), composing with the existing name search. Two files change: the component and the language data file.

**Tech Stack:** Next.js 16, React 18, TypeScript, Tailwind v3 (theme tokens `primary-color` etc.), react-query.

**Spec:** `docs/superpowers/specs/2026-08-11-student-work-status-tabs-design.md` (approved).

## Global Constraints

- All work happens in `clients/client-main-tatugaschool` (this directory is the git repo root for commits).
- Work on branch `student-work-status-tabs`, created from `main` (Task 1 creates it).
- **No test runner exists in this repo** (no jest/vitest; `npm run lint` is broken on Next 16). The verification cycle per task is `npx tsc --noEmit`; the final task runs `npm run build`.
- Use theme tokens in class names (`text-primary-color`, `border-primary-color`) — never raw hex values.
- Status enum values are spelled exactly as in `interfaces/StudentOnAssignment.ts`: `"PENDDING" | "SUBMITTED" | "REVIEWD" | "IMPROVED"` (yes, misspelled — copy verbatim).
- All user-visible strings go through `studentWorkDataLanguage` in `data/languages/classwork.ts` with `en` and `th` cases (existing switch pattern).
- Tab order is fixed: All, Wait to review (`SUBMITTED`), Reviewed (`REVIEWD`), Need Improvement (`IMPROVED`), No work (`PENDDING`).
- Default tab is All; counts always reflect the whole assigned roster (ignore the search box).

---

### Task 1: Branch + language keys

**Files:**
- Modify: `data/languages/classwork.ts` (inside the `studentWorkDataLanguage` object, which starts near line 379)

**Interfaces:**
- Consumes: existing `Language` type and `studentWorkDataLanguage` object in that file.
- Produces: `studentWorkDataLanguage.all(language: Language): string` and `studentWorkDataLanguage.emptyStatusTab(language: Language): string` — Task 2 and Task 4 call these.

- [ ] **Step 1: Create the feature branch**

```bash
git checkout main
git checkout -b student-work-status-tabs
```

- [ ] **Step 2: Add the two new language keys**

In `data/languages/classwork.ts`, inside the `studentWorkDataLanguage = { ... }` object (e.g., right after the `waitForReview` entry), add:

```ts
  all: (language: Language) => {
    switch (language) {
      case "en":
        return "All";
      case "th":
        return "ทั้งหมด";
      default:
        return "All";
    }
  },
  emptyStatusTab: (language: Language) => {
    switch (language) {
      case "en":
        return "No students in this status";
      case "th":
        return "ไม่มีนักเรียนในสถานะนี้";
      default:
        return "No students in this status";
    }
  },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add data/languages/classwork.ts
git commit -m "feat: add language keys for student work status tabs"
```

---

### Task 2: Tab bar, tab state, and render-time filter

**Files:**
- Modify: `components/subject/ClassStudentWork.tsx`

**Interfaces:**
- Consumes: `studentWorkDataLanguage.all` from Task 1; existing `StudentAssignmentStatus` type (already imported in this file); existing `studentData`, `setStudentData`, `studentOnAssignments`, `language`, `triggerHideStudentList`.
- Produces (used by Tasks 3 and 4, all inside `ClassStudentWork`):
  - `studentStatusTabs` module-level const and `type StudentStatusTab = "ALL" | StudentAssignmentStatus`
  - state `selectStatusTab: StudentStatusTab` with setter `setSelectStatusTab`
  - `handleSelectStatusTab(tab: StudentStatusTab): void`
  - `visibleStudents` — the tab+search-filtered, sorted array the table body maps over.

- [ ] **Step 1: Add the module-level tab definitions**

In `components/subject/ClassStudentWork.tsx`, below the imports (above `type Props`), add:

```tsx
const studentStatusTabs = [
  { key: "ALL", label: "all" },
  { key: "SUBMITTED", label: "waitForReview" },
  { key: "REVIEWD", label: "reviewed" },
  { key: "IMPROVED", label: "improve" },
  { key: "PENDDING", label: "noWork" },
] as const;
type StudentStatusTab = (typeof studentStatusTabs)[number]["key"];
```

- [ ] **Step 2: Add tab state and derived arrays inside `ClassStudentWork`**

Inside the `ClassStudentWork` function body (after the `studentData` state declaration), add:

```tsx
const [selectStatusTab, setSelectStatusTab] =
  useState<StudentStatusTab>("ALL");

const handleSelectStatusTab = (tab: StudentStatusTab) => {
  setSelectStatusTab(tab);
  setStudentData((prev) => prev?.map((s) => ({ ...s, select: false })));
};

// Counts ignore the search box: computed from the full fetched roster.
const assignedStudents =
  studentOnAssignments.data?.filter((s) => s.isAssigned) ?? [];

const visibleStudents = (studentData ?? [])
  .filter((d) => d.isAssigned === true)
  .filter((d) => selectStatusTab === "ALL" || d.status === selectStatusTab)
  .sort((a, b) => Number(a.number) - Number(b.number));
```

(`useState` is already imported in this file.)

- [ ] **Step 3: Render the tab bar**

In the JSX, directly after the closing `</div>` of the search/download header (the div containing the `MdSearch` input and the sidebar-toggle button) and before the table wrapper `<div className={\`${triggerHideStudentList ? "hidden" : "w-full"} ...\`}>`, add:

```tsx
{!triggerHideStudentList && (
  <div className="flex w-full shrink-0 gap-1 overflow-x-auto border-b">
    {studentStatusTabs.map((tab) => {
      const active = selectStatusTab === tab.key;
      const count =
        tab.key === "ALL"
          ? assignedStudents.length
          : assignedStudents.filter((s) => s.status === tab.key).length;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => handleSelectStatusTab(tab.key)}
          className={`flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition ${
            active
              ? "border-primary-color font-semibold text-primary-color"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          {studentWorkDataLanguage[tab.label](language.data ?? "en")}
          {studentOnAssignments.data && <span>({count})</span>}
        </button>
      );
    })}
  </div>
)}
```

Note: while data is loading, `studentOnAssignments.data` is undefined so no counts render, and the initial state keeps All active — matching the spec's loading behavior.

- [ ] **Step 4: Make the table body use `visibleStudents`**

In the `<tbody>`, the non-loading branch currently reads:

```tsx
: studentData
    ?.filter((d) => d.isAssigned === true)
    .sort((a, b) => Number(a.number) - Number(b.number))
    .map((student, index) => {
```

Replace that chain so it maps over the precomputed array instead:

```tsx
: visibleStudents.map((student, index) => {
```

(The `.map` callback body — rendering `<StudentList ... />` — stays exactly as it is.)

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 6: Manual smoke check (optional but recommended)**

Run `npm run dev` (port 8181), open an assignment's Student Work view: five tabs render with counts, clicking Wait to review shows only yellow-badge students, search still narrows within the tab, All restores everything.

- [ ] **Step 7: Commit**

```bash
git add components/subject/ClassStudentWork.tsx
git commit -m "feat: add status filter tabs to student work list"
```

---

### Task 3: Scope select-all to visible rows

**Files:**
- Modify: `components/subject/ClassStudentWork.tsx`

**Interfaces:**
- Consumes: `selectStatusTab` from Task 2 (`"ALL" | StudentAssignmentStatus`).
- Produces: nothing new — behavioral change only. (Tab-switch selection clearing already ships in Task 2's `handleSelectStatusTab`.)

- [ ] **Step 1: Scope the header select-all checkbox**

In the `<thead>`, the select-all checkbox currently sets `select` on every student:

```tsx
onChange={(e) => {
  setStudentData((prev) => {
    return prev?.map((s) => {
      return {
        ...s,
        select: e.target.checked,
      };
    });
  });
}}
```

Replace with a version that only touches rows visible under the active tab (`studentData` is already search-filtered, so tab + assigned is the remaining visibility condition):

```tsx
onChange={(e) => {
  setStudentData((prev) => {
    return prev?.map((s) => {
      if (
        s.isAssigned &&
        (selectStatusTab === "ALL" || s.status === selectStatusTab)
      ) {
        return { ...s, select: e.target.checked };
      }
      return s;
    });
  });
}}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add components/subject/ClassStudentWork.tsx
git commit -m "feat: scope select-all to students visible in active status tab"
```

---

### Task 4: Empty tab state + final build verification

**Files:**
- Modify: `components/subject/ClassStudentWork.tsx`

**Interfaces:**
- Consumes: `visibleStudents` from Task 2; `studentWorkDataLanguage.emptyStatusTab` from Task 1.
- Produces: nothing — final task.

- [ ] **Step 1: Render an empty-state row**

In the `<tbody>`, after the loading/students ternary expression (as a sibling JSX expression, still inside `<tbody>`), add:

```tsx
{!studentOnAssignments.isLoading && visibleStudents.length === 0 && (
  <tr>
    <td colSpan={5} className="p-10 text-center text-sm text-gray-500">
      {studentWorkDataLanguage.emptyStatusTab(language.data ?? "en")}
    </td>
  </tr>
)}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Full build**

Run: `npm run build`
Expected: build completes successfully (this is the strongest verification available; lint is broken).

- [ ] **Step 4: Commit**

```bash
git add components/subject/ClassStudentWork.tsx
git commit -m "feat: show empty state for status tabs with no students"
```

---

## Manual QA checklist (post-implementation, from the spec)

- Tab counts match the row badges and update within ~5s after grading.
- Search inside a tab narrows rows but counts stay roster-wide.
- In Wait to review: select-all → only visible rows checked → bulk grade applies → graded students leave the tab on next refetch.
- Switching tabs clears all selections.
- Thai labels render on all five tabs and the empty state (switch app language).
- Tab bar scrolls horizontally on a narrow viewport; sidebar-collapse hides it.
- Deep-link `?studentOnAssignmentId=` still opens the student's detail panel.
