# Complete Guide to Your Office Attendance Tracker

> A comprehensive tutorial for understanding modern web development and your codebase

**Last Updated:** February 2026
**Assumed Knowledge:** Programming basics (variables, functions, loops) but no recent web development experience

---

## Table of Contents

1. [What's Changed Since 2018](#1-whats-changed-since-2018)
2. [Understanding the Technology Stack](#2-understanding-the-technology-stack)
3. [Modern JavaScript & TypeScript Essentials](#3-modern-javascript--typescript-essentials)
4. [React Fundamentals](#4-react-fundamentals)
5. [Project Architecture](#5-project-architecture)
6. [Code Walkthrough](#6-code-walkthrough)
7. [Development Workflow](#7-development-workflow)
8. [Next Steps](#8-next-steps)

---

## 1. What's Changed Since 2018

### The Modern Web Development Landscape

Web development has evolved significantly in the past 8 years. Here are the major shifts:

#### **From jQuery to Component-Based Frameworks**
- **2018:** Manipulating the DOM directly with jQuery (`$('.button').click()`)
- **2026:** Building reusable components with React, Vue, or Svelte

#### **From JavaScript to TypeScript**
- **2018:** Plain JavaScript with limited type safety
- **2026:** TypeScript adds type checking to catch errors before runtime

#### **From Server-Side Rendering to SPAs (Single Page Applications)**
- **2018:** Server generates HTML for each page
- **2026:** JavaScript apps run entirely in the browser, no page reloads

#### **From Manual Build Processes to Modern Tooling**
- **2018:** Webpack configurations, complex build setups
- **2026:** Vite and other tools provide instant dev servers with hot reload

#### **From CSS Files to Utility-First CSS**
- **2018:** Writing custom CSS classes for every element
- **2026:** Tailwind CSS provides pre-built utility classes (`bg-blue-500`, `p-4`)

#### **From Local Storage Hacks to Proper State Management**
- **2018:** Manually managing localStorage and state
- **2026:** Libraries like Zustand handle state persistence automatically

---

## 2. Understanding the Technology Stack

Your app uses these modern tools. Let's break down each one:

### **React** (UI Library)
**What it is:** A JavaScript library for building user interfaces using reusable components

**Key Concepts:**
- **Components:** Self-contained pieces of UI (like LEGO blocks)
- **JSX:** Write HTML-like syntax inside JavaScript
- **State:** Data that changes over time and triggers re-renders
- **Props:** Data passed from parent to child components

**Why it's popular:**
- Component reusability
- Fast rendering (Virtual DOM)
- Huge ecosystem of libraries

**Example:**
```jsx
function Button() {
  return <button>Click me</button>
}
```

### **TypeScript** (Language)
**What it is:** JavaScript with type annotations

**Before (JavaScript):**
```javascript
function add(a, b) {
  return a + b
}
add(5, "10") // Returns "510" - bug!
```

**After (TypeScript):**
```typescript
function add(a: number, b: number): number {
  return a + b
}
add(5, "10") // ERROR: string not assignable to number
```

**Benefits:**
- Catch errors while coding
- Better IDE autocomplete
- Self-documenting code

### **Vite** (Build Tool)
**What it is:** A lightning-fast development server and build tool

**What it does:**
- Starts a local dev server in milliseconds
- Hot Module Replacement (HMR) - changes appear instantly
- Optimizes code for production

**Old way (2018):** Wait 30-60 seconds for Webpack to start
**New way (2026):** Vite starts instantly

### **Tailwind CSS** (Styling Framework)
**What it is:** Utility-first CSS framework

**Old way (2018):**
```css
.card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```
```html
<div class="card">Content</div>
```

**New way (2026):**
```jsx
<div className="bg-white rounded-lg p-4 shadow-sm">Content</div>
```

**Benefits:**
- No naming things ("what do I call this class?")
- No context switching between files
- Consistent design system

### **shadcn/ui** (Component Library)
**What it is:** Pre-built, accessible UI components you can copy into your project

**Key difference from traditional libraries:**
- You OWN the code (it's copied to your project)
- Fully customizable
- Built with Radix UI (accessible primitives) + Tailwind

**Components used in this app:**
- `Calendar` - Interactive date picker
- `Card` - Container with header/content sections
- `Button` - Styled, accessible buttons

### **Zustand** (State Management)
**What it is:** A tiny, modern state management library

**The Problem:**
React components can't easily share data. Passing data through many levels ("prop drilling") gets messy.

**The Solution:**
Zustand creates a global store that any component can access.

**Example:**
```typescript
// Create store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))

// Use in any component
function Counter() {
  const { count, increment } = useStore()
  return <button onClick={increment}>{count}</button>
}
```

**Why Zustand (vs Redux):**
- 10x less boilerplate
- Easier to learn
- Built-in persistence to localStorage

### **date-fns** (Date Library)
**What it is:** Modern date manipulation library

**Why not use native Date objects?**
- JavaScript's Date API is notoriously bad
- Timezone bugs are common
- date-fns provides simple, reliable functions

**Example:**
```typescript
import { subWeeks, startOfMonth } from 'date-fns'

const threeMonthsAgo = subWeeks(new Date(), 13)
const monthStart = startOfMonth(new Date())
```

### **npm** (Package Manager)
**What it is:** Tool for installing and managing JavaScript libraries

**Think of it like:**
- App Store for code libraries
- `package.json` = shopping list
- `node_modules` = downloaded libraries

**Common commands:**
```bash
npm install          # Install all dependencies
npm run dev          # Start development server
npm run build        # Create production build
```

---

## 3. Modern JavaScript & TypeScript Essentials

### Features You Need to Know

#### **Arrow Functions**
```javascript
// Old
function add(a, b) {
  return a + b
}

// New (shorter, cleaner)
const add = (a, b) => a + b
```

#### **Destructuring**
```javascript
// Extract values from objects/arrays
const user = { name: 'John', age: 30 }
const { name, age } = user // name = 'John', age = 30

const [first, second] = [1, 2, 3] // first = 1, second = 2
```

#### **Spread Operator (...)**
```javascript
// Copy arrays/objects
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5] // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1, c: 3 } // { a: 1, b: 2, c: 3 }
```

#### **Template Literals**
```javascript
// Old
const message = 'Hello ' + name + ', you are ' + age + ' years old'

// New
const message = `Hello ${name}, you are ${age} years old`
```

#### **Optional Chaining (?.)**
```javascript
// Old (risky - crashes if user is null)
const city = user.address.city

// New (safe - returns undefined if any part is null)
const city = user?.address?.city
```

#### **Nullish Coalescing (??)**
```javascript
// Use default value only if null/undefined (not for 0 or "")
const count = data.count ?? 0
```

#### **Async/Await**
```javascript
// Old (callback hell)
fetchUser(id, function(user) {
  fetchPosts(user, function(posts) {
    console.log(posts)
  })
})

// New (clean, linear)
const user = await fetchUser(id)
const posts = await fetchPosts(user)
console.log(posts)
```

#### **TypeScript Interfaces**
Define the "shape" of objects:

```typescript
interface User {
  name: string
  age: number
  email?: string  // Optional property
}

const user: User = {
  name: 'John',
  age: 30
} // Valid - email is optional
```

---

## 4. React Fundamentals

### Core Concepts

#### **Components**
Everything is a component - a self-contained piece of UI:

```tsx
// Simple component
function Greeting() {
  return <h1>Hello World</h1>
}

// Component with props (input data)
function Greeting({ name }: { name: string }) {
  return <h1>Hello {name}</h1>
}

// Using it
<Greeting name="John" />
```

#### **JSX - JavaScript + XML**
Write HTML-like code in JavaScript:

```jsx
const element = (
  <div className="container">
    <h1>Title</h1>
    <p>Paragraph</p>
  </div>
)
```

**Key differences from HTML:**
- `className` instead of `class`
- `onClick` instead of `onclick`
- Must close all tags (`<img />`, `<input />`)
- Can embed JavaScript with `{}`

#### **State - Data That Changes**
State triggers re-renders when it changes:

```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0) // Initial value = 0

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

**Rules:**
- Never modify state directly: `count++` ❌
- Always use setter: `setCount(count + 1)` ✅

#### **Props - Passing Data Down**
Components receive data from parents via props:

```tsx
function Parent() {
  return <Child message="Hello" count={42} />
}

function Child({ message, count }: { message: string; count: number }) {
  return <p>{message} - {count}</p>
}
```

**Key concept:** Data flows DOWN (parent → child), never up

#### **Hooks - Special Functions**
Hooks let you use React features in functional components:

- `useState` - Add state
- `useRef` - Reference DOM elements
- Custom hooks - Create reusable logic

```tsx
// Reference a DOM element
const inputRef = useRef<HTMLInputElement>(null)

// Access it
inputRef.current?.focus()
```

---

## 5. Project Architecture

### File Structure

```
attendanceTracker/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   └── button.tsx
│   │   ├── AttendanceCalendar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   └── Layout.tsx
│   ├── lib/                # Utility functions
│   │   ├── dateUtils.ts    # Date formatting & calculations
│   │   └── utils.ts        # General utilities
│   ├── store/              # State management
│   │   └── attendanceStore.ts
│   ├── __tests__/          # Unit tests
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

### Data Flow

```
┌─────────────────────────────────────┐
│  Browser localStorage               │
│  { "attendance-storage": [...] }    │
└─────────────┬───────────────────────┘
              │
              │ Zustand persist middleware
              │ (auto-saves on changes)
              ↓
┌─────────────────────────────────────┐
│  Zustand Store (attendanceStore)    │
│  - dates: string[]                  │
│  - toggleDate()                     │
│  - isPresent()                      │
└─────────────┬───────────────────────┘
              │
              │ Components subscribe
              ↓
┌─────────────────────────────────────┐
│  React Components                   │
│  - AttendanceCalendar               │
│  - Dashboard                        │
│  - Settings                         │
└─────────────────────────────────────┘
```

### Application Flow

1. **Startup** (`main.tsx`)
   - Loads React app into `<div id="root">`
   - Zustand loads data from localStorage

2. **Rendering** (`Layout.tsx`)
   - Shows calendar + dashboard + settings
   - Manages which month is displayed

3. **User Interaction**
   - Click date → `toggleDate()` → Zustand updates state
   - State change → Components re-render
   - Zustand auto-saves to localStorage

4. **Statistics**
   - Dashboard reads dates from store
   - Calculates counts using date-fns

---

## 6. Code Walkthrough

### Entry Point: `main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**What's happening:**
1. Find the `<div id="root">` in `index.html`
2. Create a React rendering root
3. Render the `<App>` component inside `<StrictMode>` (development mode warnings)

**Key points:**
- `!` after `getElementById` = TypeScript "trust me, this won't be null"
- `StrictMode` = Extra checks in development (removed in production)

---

### Root Component: `App.tsx`

```tsx
import './App.css'
import Layout from './components/Layout'

function App() {
  return <Layout />
}

export default App
```

**Why so simple?**
- Separation of concerns
- `App.tsx` is just the entry point
- All real UI is in `Layout.tsx`

---

### State Management: `store/attendanceStore.ts`

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AttendanceState {
  dates: string[]                      // Array of "YYYY-MM-DD" strings
  toggleDate: (date: string) => void   // Add/remove date
  isPresent: (date: string) => boolean // Check if date exists
  replaceAll: (dates: string[]) => void // Import: replace all
  mergeWith: (dates: string[]) => void  // Import: merge with existing
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      dates: [],

      toggleDate: (date: string) => {
        set((state) => {
          const exists = state.dates.includes(date)
          return {
            dates: exists
              ? state.dates.filter((d) => d !== date)  // Remove
              : [...state.dates, date],                // Add
          }
        })
      },

      isPresent: (date: string) => {
        return get().dates.includes(date)
      },

      replaceAll: (dates: string[]) => {
        const uniqueDates = Array.from(new Set(dates)) // Remove duplicates
        set({ dates: uniqueDates })
      },

      mergeWith: (dates: string[]) => {
        set((state) => {
          const combined = Array.from(new Set([...state.dates, ...dates]))
          return { dates: combined }
        })
      },
    }),
    {
      name: 'attendance-storage',              // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ dates: state.dates }), // Only persist dates
    }
  )
)
```

**Breaking it down:**

1. **Interface** - Defines the shape of the store
2. **create()** - Creates the Zustand store
3. **persist()** - Middleware that auto-saves to localStorage
4. **set()** - Update state (triggers re-render)
5. **get()** - Read current state

**Key patterns:**

**Immutable updates:**
```tsx
// ❌ Wrong - mutates state
state.dates.push(date)

// ✅ Right - creates new array
[...state.dates, date]
```

**Why YYYY-MM-DD strings?**
- Avoids timezone bugs with Date objects
- Easy to store in JSON
- Easy to compare (`date1 === date2`)

---

### Date Utilities: `lib/dateUtils.ts`

```tsx
import { subWeeks, startOfMonth, endOfMonth } from 'date-fns'

// Convert Date object → "YYYY-MM-DD"
export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Convert "YYYY-MM-DD" → Date object (LOCAL timezone)
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

// Count dates in a specific month
export function countForMonth(dates: string[], displayMonth: Date): number {
  const monthStart = startOfMonth(displayMonth)
  const monthEnd = endOfMonth(displayMonth)

  return dates.filter((dateKey) => {
    const date = parseDateKey(dateKey)
    return date >= monthStart && date <= monthEnd
  }).length
}

// Count dates in last 91 days
export function countRolling13Weeks(
  dates: string[],
  today: Date = new Date()
): number {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDate = subWeeks(todayStart, 13)

  return dates.filter((dateKey) => {
    const date = parseDateKey(dateKey)
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return dateStart >= startDate && dateStart <= todayStart
  }).length
}
```

**Why local timezone?**

```javascript
// ❌ WRONG - Creates UTC date, off by timezone
new Date("2024-01-15") // Might become Jan 14 in PST

// ✅ RIGHT - Creates local date
new Date(2024, 0, 15)  // Always Jan 15 locally
```

**Why "start of day"?**
- Removes time component (12:34:56)
- Makes comparisons accurate (only care about dates, not times)

---

### Main Layout: `components/Layout.tsx`

```tsx
import { useState } from 'react'
import AttendanceCalendar from './AttendanceCalendar'
import Dashboard from './Dashboard'
import Settings from './Settings'

export default function Layout() {
  // Track which month the calendar is showing
  const [displayMonth, setDisplayMonth] = useState(new Date())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Office Attendance Tracker
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile: Stats first, Calendar second */}
          {/* Desktop: Calendar left, Stats right */}

          <div className="order-2 md:order-1 flex-1">
            <AttendanceCalendar
              displayMonth={displayMonth}
              onMonthChange={setDisplayMonth}
            />
          </div>

          <div className="order-1 md:order-2 flex-1 space-y-6">
            <Dashboard displayMonth={displayMonth} />
            <Settings />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Tailwind classes explained:**

- `min-h-screen` - Minimum height = full viewport
- `bg-gray-50` - Light gray background
- `container mx-auto` - Centered container
- `px-4 py-8` - Padding (x=horizontal, y=vertical)
- `flex flex-col md:flex-row` - Stack vertically, then horizontally on medium+ screens
- `order-1 order-2` - Change order on mobile vs desktop

**Responsive design:**
- Mobile: Dashboard on top, Calendar below
- Desktop: Calendar left, Dashboard/Settings right

---

### Calendar Component: `components/AttendanceCalendar.tsx`

```tsx
import { Calendar } from '@/components/ui/calendar'
import { useAttendanceStore } from '@/store/attendanceStore'
import { formatDateKey, parseDateKey } from '@/lib/dateUtils'

interface AttendanceCalendarProps {
  displayMonth: Date
  onMonthChange: (date: Date) => void
}

export default function AttendanceCalendar({
  displayMonth,
  onMonthChange,
}: AttendanceCalendarProps) {
  // Get dates and toggleDate from Zustand store
  const { dates, toggleDate } = useAttendanceStore()

  // Convert string dates to Date objects for react-day-picker
  const selectedDates = dates.map(parseDateKey)

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      toggleDate(formatDateKey(day))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onDayClick={handleDayClick}
        month={displayMonth}
        onMonthChange={onMonthChange}
        modifiersClassNames={{
          selected: 'attendance-selected',
        }}
        className="attendance-calendar"
      />
    </div>
  )
}
```

**Key concepts:**

1. **Props interface** - TypeScript definition of expected props
2. **useAttendanceStore()** - Subscribe to Zustand store (auto re-renders on changes)
3. **Data transformation** - Store has strings, Calendar component needs Date objects
4. **Event handler** - Convert Date back to string before storing

**The `@/` alias:**
- Configured in `vite.config.ts`
- `@/` = `/src/`
- Makes imports cleaner: `@/store/attendanceStore` vs `../../../store/attendanceStore`

---

### Dashboard Component: `components/Dashboard.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAttendanceStore } from '@/store/attendanceStore'
import { countForMonth, countRolling13Weeks } from '@/lib/dateUtils'

interface DashboardProps {
  displayMonth: Date
}

export default function Dashboard({ displayMonth }: DashboardProps) {
  const { dates } = useAttendanceStore()

  const monthCount = countForMonth(dates, displayMonth)
  const rolling13WeeksCount = countRolling13Weeks(dates)

  const monthName = displayMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{monthCount}</div>
          <p className="text-sm text-muted-foreground mt-1">{monthName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rolling 13 Weeks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{rolling13WeeksCount}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Last 91 days from today
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**How it works:**

1. Get dates from store
2. Calculate statistics
3. Display in shadcn/ui Cards

**Reactive updates:**
- When dates change in store → component re-renders
- Counts recalculate automatically

---

### Settings Component: `components/Settings.tsx`

```tsx
import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import { useAttendanceStore } from '@/store/attendanceStore'

export default function Settings() {
  const { dates, replaceAll, mergeWith } = useAttendanceStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    // Convert dates to JSON
    const dataStr = JSON.stringify(dates, null, 2)

    // Create downloadable file
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance_backup.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedDates = JSON.parse(content)

        // Validate data
        if (!Array.isArray(importedDates)) {
          alert('Invalid file: Expected an array of dates')
          return
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        const allValid = importedDates.every(
          (d) => typeof d === 'string' && dateRegex.test(d)
        )

        if (!allValid) {
          alert('Invalid file: All dates must be in YYYY-MM-DD format')
          return
        }

        // Ask user: replace or merge?
        const shouldReplace = window.confirm(
          'Replace all existing data?\n\nOK = Replace all\nCancel = Merge with existing'
        )

        if (shouldReplace) {
          replaceAll(importedDates)
        } else {
          mergeWith(importedDates)
        }

        alert(`Successfully imported ${importedDates.length} dates!`)
      } catch (error) {
        alert('Error reading file: ' + (error as Error).message)
      }
    }

    reader.readAsText(file)

    // Reset input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleExport}
          variant="outline"
          className="w-full"
          style={{ minHeight: '44px' }}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Backup
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
          style={{ minHeight: '44px' }}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Backup
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground">
          Current data: {dates.length} attendance day{dates.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  )
}
```

**Key techniques:**

1. **useRef** - Reference DOM elements
   ```tsx
   const fileInputRef = useRef<HTMLInputElement>(null)
   // Later: fileInputRef.current?.click()
   ```

2. **Blob API** - Create downloadable files in the browser
3. **FileReader API** - Read uploaded files
4. **Data validation** - Check format before importing
5. **Hidden input trick** - Style a button, but trigger file input on click

**Icons:**
- `lucide-react` provides 1000+ open-source icons
- Used as React components: `<Download />`

---

### Build Configuration: `vite.config.ts`

```tsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/AttendanceTracker/',  // GitHub Pages subdirectory
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // @/ = /src/
    },
  },
})
```

**What each part does:**

- `plugins: [react()]` - Enable JSX/TSX support
- `plugins: [tailwindcss()]` - Process Tailwind classes
- `base: '/AttendanceTracker/'` - Deploy to github.com/user/AttendanceTracker/
- `alias: { '@': './src' }` - Use `@/` imports

---

## 7. Development Workflow

### Starting Development

```bash
# Navigate to project
cd /Users/sebastianalonso/Documents/claudePlayground/attendanceTracker

# Start dev server
npm run dev
```

**What happens:**
1. Vite starts at `http://localhost:5173`
2. Opens in browser automatically
3. Watches files for changes
4. Hot Module Replacement (HMR) - changes appear instantly

### Making Changes

**Example: Change the title**

1. Open `src/components/Layout.tsx`
2. Change line 12:
   ```tsx
   <h1 className="text-3xl font-bold text-center mb-8">
     My Custom Title
   </h1>
   ```
3. Save file
4. Browser updates instantly (no refresh needed!)

### Building for Production

```bash
npm run build
```

**What happens:**
1. TypeScript compiles to JavaScript
2. Vite bundles and minifies code
3. Output goes to `/dist` folder
4. Ready to deploy!

### Running Tests

```bash
npm run test        # Watch mode
npm run test:run    # Run once
```

**Tests are in:** `src/__tests__/`

---

## 8. Next Steps

### Learning Path

#### **Beginner (Next 1-2 weeks)**
1. Experiment with styling
   - Change Tailwind classes
   - Try different colors: `bg-blue-500`, `text-red-600`
   - Adjust spacing: `p-8`, `m-4`, `gap-6`

2. Modify text content
   - Change titles and labels
   - Add new text sections

3. Read the official docs:
   - [React Tutorial](https://react.dev/learn)
   - [Tailwind Docs](https://tailwindcss.com/docs)

#### **Intermediate (Next month)**
1. Add new features:
   - Add notes to specific dates
   - Color-code dates (sick, vacation, office)
   - Weekly view instead of monthly

2. Learn more hooks:
   - `useEffect` - Side effects (API calls, etc.)
   - `useMemo` - Performance optimization
   - `useCallback` - Memoize functions

3. TypeScript deep dive:
   - Generic types
   - Utility types (`Partial<T>`, `Pick<T, K>`)
   - Type guards

#### **Advanced (Next 3 months)**
1. Add backend integration:
   - Learn REST APIs
   - Fetch data from a server
   - Authentication

2. Advanced state management:
   - Context API
   - React Query (server state)
   - Optimistic updates

3. Testing:
   - Write more unit tests
   - Integration tests
   - End-to-end tests (Playwright, Cypress)

### Common Tasks

#### **Add a new component**

```tsx
// src/components/MyComponent.tsx
export default function MyComponent() {
  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      Hello from my component!
    </div>
  )
}

// Use it in Layout.tsx
import MyComponent from './MyComponent'

// Inside Layout's return:
<MyComponent />
```

#### **Add to the store**

```tsx
// In attendanceStore.ts, add to interface:
interface AttendanceState {
  // ... existing properties
  notes: Record<string, string>  // date → note
  setNote: (date: string, note: string) => void
}

// Add to store:
notes: {},
setNote: (date, note) => {
  set((state) => ({
    notes: { ...state.notes, [date]: note }
  }))
}
```

#### **Install a new package**

```bash
npm install package-name

# Example:
npm install react-icons
```

### Debugging Tips

#### **Console logging**
```tsx
console.log('displayMonth:', displayMonth)
console.log('dates:', dates)
```

#### **React DevTools**
- Install browser extension
- Inspect component props and state
- Time-travel debugging

#### **TypeScript errors**
- Read from bottom up
- Check for typos in property names
- Ensure all required props are passed

### Common Pitfalls

1. **Mutating state**
   ```tsx
   // ❌ Wrong
   dates.push(newDate)

   // ✅ Right
   setDates([...dates, newDate])
   ```

2. **Forgetting dependencies**
   ```tsx
   // If using useEffect (not in this project yet)
   useEffect(() => {
     // Uses 'count'
   }, [count]) // Must include 'count'
   ```

3. **className vs class**
   ```tsx
   // ❌ Wrong
   <div class="container">

   // ✅ Right
   <div className="container">
   ```

### Resources

#### **Documentation**
- [React](https://react.dev) - Official React docs
- [TypeScript](https://www.typescriptlang.org/docs/) - TS handbook
- [Tailwind CSS](https://tailwindcss.com/docs) - All utility classes
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [date-fns](https://date-fns.org/docs) - Date functions
- [Vite](https://vite.dev) - Build tool

#### **Learning Platforms**
- [Frontend Masters](https://frontendmasters.com) - Deep courses (paid)
- [egghead.io](https://egghead.io) - Short video lessons
- [JavaScript.info](https://javascript.info) - Modern JS tutorial (free)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - Free book

#### **Communities**
- [Reactiflux Discord](https://www.reactiflux.com/) - React community
- [r/reactjs](https://reddit.com/r/reactjs) - Reddit community
- [Stack Overflow](https://stackoverflow.com/questions/tagged/reactjs) - Q&A

---

## Glossary

**Component** - Reusable piece of UI (like a LEGO block)

**Props** - Data passed from parent to child component

**State** - Data that changes and triggers re-renders

**Hook** - Special function that lets you use React features (`useState`, `useRef`, etc.)

**JSX** - JavaScript syntax extension that looks like HTML

**TypeScript** - JavaScript with type annotations

**SPA (Single Page Application)** - App that runs entirely in the browser, no page reloads

**HMR (Hot Module Replacement)** - Update code without full page refresh

**Virtual DOM** - React's internal representation of the UI for efficient updates

**localStorage** - Browser storage that persists between sessions

**Middleware** - Function that intercepts/modifies behavior (Zustand's persist)

**Destructuring** - Extract values from objects/arrays (`const { name } = user`)

**Spread operator** - Copy/merge arrays/objects (`[...arr]`, `{...obj}`)

**Arrow function** - Shorter function syntax (`() => {}`)

**Utility-first CSS** - Build styles by combining small utility classes (Tailwind)

**Build tool** - Software that bundles/optimizes code for production (Vite)

**Package manager** - Tool for installing libraries (npm, yarn, pnpm)

**Node.js** - JavaScript runtime outside the browser

---

## Conclusion

You now have a complete mental model of:
- Modern web development (2026 edition)
- React and TypeScript fundamentals
- Your entire codebase architecture
- How to make changes and add features

**Remember:**
- Start small - tweak existing code before adding features
- Read error messages carefully
- Use console.log liberally
- Google is your friend ("react how to X")
- Don't be afraid to break things - you can always undo!

**Your app is:**
- Well-architected
- Following modern best practices
- Easy to extend
- Fully type-safe
- Production-ready

Welcome back to programming! 🚀
