# Office Attendance Tracker — Cloud Migration PRD

This document is the specification for migrating the Office Attendance Tracker from localStorage persistence to Supabase cloud persistence.

Read this entire document and the existing codebase before writing any code. Understand the current data structures, component hierarchy, and state management patterns before designing the database schema or making changes.

---

## Constraints & Assumptions

- The existing codebase is React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui + Zustand + date-fns.
- The app is deployed to GitHub Pages at base path `/attendanceTracker/`.
- Light mode and dark mode are already implemented.
- The existing localStorage key is `attendance-storage` (Zustand persist middleware).
- Supabase free tier is the target backend. A project has been provisioned and the Project URL and anon key are available.
- Email/password auth is enabled in the Supabase dashboard. Social logins are not required.

---

## 1. Architecture: Vendor-Agnostic Data Layer

All database and auth access MUST go through abstraction interfaces. No component or hook may import `@supabase/supabase-js` directly — only the implementation files may do so.

### 1.1 Interfaces

Create these in `src/services/interfaces.ts`:

```typescript
export interface AttendanceRepository {
  /** Fetch attendance dates for the current user within a date range (inclusive, YYYY-MM-DD). */
  getDates(startDate: string, endDate: string): Promise<string[]>;

  /** Fetch all attendance dates for the current user. */
  getAllDates(): Promise<string[]>;

  /** Add an attendance date. Returns true on success. */
  addDate(date: string): Promise<boolean>;

  /** Remove an attendance date. Returns true on success. */
  removeDate(date: string): Promise<boolean>;

  /** Toggle a date. Returns true if date is now marked, false if removed. */
  toggleDate(date: string): Promise<boolean>;

  /** Export all dates (for backup). */
  exportAll(): Promise<string[]>;

  /** Import dates in bulk. 'replace' deletes all existing data first. 'merge' upserts. */
  importDates(dates: string[], mode: 'replace' | 'merge'): Promise<void>;
}

export interface AuthProvider {
  signUp(email: string, password: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (session: Session | null) => void): () => void;
  resetPassword(email: string): Promise<void>;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface Session {
  userId: string;
  email: string;
}
```

### 1.2 Database Schema

Design the Supabase database schema yourself. Examine the existing codebase — particularly the Zustand store, the data structures used for attendance dates, and how dates flow through the app — then create a schema that:

- Stores attendance records tied to authenticated users.
- Prevents duplicate entries for the same user + date.
- Supports efficient range queries (needed for rolling 13-week stats).
- Uses Row Level Security so users can only access their own data.
- Includes any indexes needed for the query patterns above.

Produce the final SQL as a migration file at `supabase/migrations/001_initial_schema.sql` so it can be reviewed and applied manually. If database functions (RPCs) would reduce client round-trips or simplify logic, create them and include them in the migration file.

### 1.3 Supabase Implementations

Create a Supabase client init file and implementations for both interfaces:

- `SupabaseAttendanceRepository` implementing `AttendanceRepository`
- `SupabaseAuthProvider` implementing `AuthProvider`

Place these under `src/services/supabase/`. Design the implementation to match the schema you created.

### 1.4 Service Context

Create a React context that provides both services to the component tree:

```typescript
const ServiceContext = createContext<{
  auth: AuthProvider;
  attendance: AttendanceRepository;
} | null>(null);

export function ServiceProvider({ auth, attendance, children }) { ... }
export function useAuth(): AuthProvider { ... }
export function useAttendance(): AttendanceRepository { ... }
```

Wire up at the app root with the Supabase implementations.

---

## 2. Authentication

### 2.1 Auth Pages

Create a full-screen `/login` route with:
- A centered card matching the app's existing design language (shadcn/ui Card).
- Two modes toggled by a link: "Sign In" and "Sign Up".
- Fields: email (type `email`), password (type `password`). Sign Up adds a "Confirm password" field.
- A "Forgot password?" link below the sign-in form that calls `auth.resetPassword(email)` and shows a confirmation message.
- Inline validation errors from the auth provider.
- A submit button with loading spinner state.
- Must respect light/dark mode.

### 2.2 Protected Routes

Create an `AuthGuard` wrapper component:
- If session exists → render children.
- If no session → redirect to `/login`.
- While checking session → show a full-page loading spinner.

All routes except `/login` must be wrapped in `AuthGuard`.

### 2.3 Auth State

Use a top-level `useEffect` that calls `auth.onAuthStateChange()` and stores the session in React state (or a small Zustand slice). On sign-out, clear all local state and redirect to `/login`.

---

## 3. Data Flow

### 3.1 Hydration (App Mount / Login)

When the user is authenticated and the main app mounts:
1. Set `isLoading: true` in the store.
2. Call `attendance.getAllDates()`.
3. Populate the Zustand store's `dates` set.
4. Set `isLoading: false`.

Show a skeleton/spinner on the calendar and stats panels during loading.

### 3.2 Toggling a Date (Click Handler)

1. **Optimistic update:** Immediately toggle the date in the Zustand `dates` set. The UI updates instantly.
2. **Persist:** Call `attendance.toggleDate(date)`.
3. **On success:** No action needed (local state already correct).
4. **On failure:** Roll back the toggle in local state. Show an error toast.

### 3.3 Stats Computation

Stats (current month count, rolling 13-week total) are computed from the local Zustand `dates` set, exactly as before. The only change is that the set is hydrated from the database instead of localStorage.

---

## 4. State Management Changes

### 4.1 Remove Zustand `persist` Middleware

The database is now the source of truth. Remove the `persist` middleware from the store entirely.

### 4.2 New Store Shape

```typescript
interface AttendanceUIState {
  dates: Set<string>;
  isLoading: boolean;
  error: string | null;
  viewedMonth: Date;

  hydrate(): Promise<void>;       // fetches from DB
  toggleDate(date: string): Promise<void>;  // optimistic + persist
  setViewedMonth(date: Date): void;
  setDates(dates: string[]): void;
  clearAll(): void;                // for sign-out cleanup
}
```

The store needs access to the `AttendanceRepository` instance. Determine the best way to achieve this given the existing codebase patterns — options include a store factory function, initializing the store inside the `ServiceProvider`, or passing the repository via a setter.

---

## 5. UI Changes

### 5.1 New Components to Create

| Component | Description |
|---|---|
| `LoginPage` | Auth form (sign in / sign up / forgot password) |
| `AuthGuard` | Session check wrapper |
| `UserMenu` | Displays email, sign-out button, settings link |
| `MigrationPrompt` | One-time localStorage import dialog |
| `LoadingSkeleton` | Skeleton for calendar/stats during hydration |

For error feedback (toasts), use shadcn/ui Sonner or Toast — pick whichever is already in the project or fits best.

### 5.2 Components to Modify

| Component | Change |
|---|---|
| App root | Wrap in `ServiceProvider` and `AuthGuard`. Add routing. |
| Calendar wrapper | Wire click handler through `store.toggleDate()` (which now does optimistic + DB). Add loading state. |
| Stats panel | No logic changes. Add loading skeleton. |
| Export button | Change to call `attendance.exportAll()` instead of reading localStorage. |
| Import handler | Change to call `attendance.importDates(dates, mode)` then re-hydrate the store. |
| Layout / header | Add `UserMenu` component. |

Use your knowledge of the existing component names and file structure — the names above are descriptive, not necessarily the actual filenames in the project.

### 5.3 Routing

Add a minimal router (react-router-dom or a simple conditional — choose based on what fits the existing codebase):

```
/login          → LoginPage (public)
/               → Main app (protected by AuthGuard)
```

Base path must remain `/attendanceTracker/`.

---

## 6. localStorage Migration

On first authenticated app mount:

1. Check if `localStorage.getItem('attendance-storage')` exists.
2. If yes, parse it and extract the dates array.
3. Show a `MigrationPrompt` dialog: "We found existing attendance data on this device. Import it to your account?"
4. On confirm: call `attendance.importDates(localDates, 'merge')`, then re-hydrate the store, then clear the localStorage key.
5. On dismiss: offer to clear it or keep for later.

---

## 7. Environment Variables

Create `.env.local` (gitignored):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Create `.env.example` (committed) with the same keys and empty values.

For GitHub Actions deployment, add these as repository secrets and inject them at build time.

---

## 8. Error Handling Requirements

| Scenario | Behavior |
|---|---|
| Toggle fails (network) | Roll back optimistic update. Show error toast. |
| Hydration fails | Show error state with retry button. |
| Auth session expired | Redirect to `/login` with message "Session expired. Please sign in again." |
| Import fails (bad format) | Show toast: "Invalid file format." |
| Import fails (network) | Show toast: "Import failed. Please try again." |
| Sign-up with existing email | Show inline error: "An account with this email already exists." |
| Wrong password | Show inline error: "Invalid email or password." |

---

## 9. Testing Requirements

- Unit test the Supabase repository implementation with a mocked Supabase client.
- Unit test the Supabase auth provider with a mocked Supabase client.
- Unit test the Zustand store's `hydrate` and `toggleDate` with a mocked repository.
- Integration test: `LoginPage` renders, validates inputs, calls auth provider.
- Integration test: `AuthGuard` redirects when no session.
- Integration test: Calendar toggle triggers optimistic update and repository call.
- Keep all existing tests passing.

---

## 10. Implementation Order

Execute these steps sequentially. Do not skip ahead.

1. Install required dependencies (`@supabase/supabase-js`, a router if needed).
2. Create `src/services/interfaces.ts` — define all interfaces.
3. Design the database schema. Write the SQL migration file.
4. Create the Supabase client init file.
5. Create `SupabaseAuthProvider`.
6. Create `SupabaseAttendanceRepository`.
7. Create `ServiceContext` with provider and hooks.
8. Create `LoginPage` component.
9. Create `AuthGuard` component.
10. Refactor app root: add `ServiceProvider`, router, `AuthGuard`.
11. Refactor Zustand store: remove `persist`, add `hydrate`, change `toggleDate` to optimistic + async.
12. Update calendar click handler to use new store action.
13. Update export/import to use repository.
14. Add `UserMenu` to header.
15. Add `MigrationPrompt` for localStorage migration.
16. Add loading skeletons and error toasts.
17. Create `.env.example` and update `.gitignore`.
18. Update GitHub Actions workflow to inject env vars at build.
19. Write/update tests.
20. Update README.

---

## 11. Files to Create (Minimum)

```
supabase/
  migrations/
    001_initial_schema.sql
src/
  services/
    interfaces.ts
    ServiceContext.tsx
    supabase/
      client.ts
      SupabaseAuthProvider.ts
      SupabaseAttendanceRepository.ts
  pages/
    LoginPage.tsx
  components/
    AuthGuard.tsx
    UserMenu.tsx
    MigrationPrompt.tsx
    LoadingSkeleton.tsx
.env.example
```

Adjust paths and add additional files as needed to match the existing project structure.

## 12. Files to Modify

Identify and modify the relevant existing files for:
- App root (ServiceProvider, router, AuthGuard wrapping)
- Zustand store (remove persist, add hydrate/async toggleDate/clearAll)
- Calendar component (new store action, loading state)
- Stats component (loading skeleton)
- Export/import functionality (route through repository)
- Layout/header (add UserMenu)
- `.gitignore` (add `.env.local`)
- `vite.config.ts` (ensure env vars work)
- `package.json` (new dependencies)

---

## Phase 2 Features (Post-MVP)

Implement these only after the core migration is complete and stable. Each feature is independent; implement in any order based on priority.

### F1. Offline Support with Sync Queue

**Goal:** App remains functional without network connectivity.

- Create a sync queue that stores pending operations when the network is unavailable (IndexedDB or similar).
- On reconnect, replay the queue sequentially.
- Show an "offline" indicator in the UI.
- Conflict resolution: last-write-wins.

### F2. Attendance Targets & Streaks

**Goal:** Users set weekly in-office goals and track compliance.

- Add a user settings table to the database for storing per-user preferences (e.g., weekly target: 1–5 days).
- Extend the service interfaces with a `UserSettingsRepository`.
- UI: settings modal for target, stats panel additions showing "This week: X / Y days", current streak, best streak.
- A week counts as "on target" if attendance count ≥ weekly target. Streak = consecutive qualifying weeks.

### F3. Team View

**Goal:** Users can join a team and see aggregate attendance.

- Design tables for teams and team membership with appropriate RLS.
- Join mechanism: invite codes.
- UI: "Team" tab showing aggregate stats ("X of Y members in-office on [date]").
- Privacy: show only aggregates, not individual calendars of other members.

### F4. Weekly / Monthly Reports

**Goal:** Visualize attendance patterns over time.

- Day-of-week heatmap (which days user most often attends, last 13 weeks).
- Month-over-month bar chart (last 12 months). Use a charting library like recharts.
- Year heatmap (GitHub-contribution-style grid).
- All computed client-side from the `dates` set already in memory. No new API calls needed.

### F5. Supabase Realtime Sync

**Goal:** Multiple tabs/devices stay in sync automatically.

- Subscribe to Supabase Realtime changes on the attendance table filtered to the current user.
- On remote INSERT → add date to local state. On remote DELETE → remove.
- Guard against echoing own changes.

### F6. Calendar Integration (iCal Export)

**Goal:** Export attendance as an `.ics` file importable into Google Calendar, Outlook, etc.

- Generate iCal with one all-day VEVENT per attendance date.
- Add an "Export as Calendar" button alongside JSON export.
