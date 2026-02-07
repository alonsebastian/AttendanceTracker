# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Office Attendance Tracker — a local-first SPA for toggling "in-office" dates on a calendar with stats and backup/restore. All data lives in the browser via localStorage.

## Tech Stack

React + TypeScript, Vite, Tailwind CSS, shadcn/ui (Calendar component), Zustand (with persist middleware), date-fns.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

## Architecture

**State**: Single Zustand store (`useAttendanceStore`) with `persist` middleware writing to localStorage. State holds an array of `YYYY-MM-DD` strings. Actions: `toggleDate(date)`, `isPresent(date)`.

**Date handling**: All dates stored as local `YYYY-MM-DD` strings (not UTC timestamps) to avoid timezone off-by-one errors.

**Key components**:
- Calendar wrapper around shadcn/ui `Calendar` — toggles dates via store, highlights selected dates with green styling, keeps today visually distinct
- Dashboard/Stats panel — current month count + rolling 13-week total (last 91 days from today, calculated with `date-fns` `subWeeks`)
- Settings panel — JSON export (`attendance_backup.json`) and file-input import for data backup/restore

**Layout**: Responsive — side-by-side on desktop (calendar left, stats right), stacked on mobile (stats top, calendar below). Touch targets >= 44x44px.

## Hosting

Configured for GitHub Pages deployment.
