# Office Attendance Tracker

A local-first single-page application for tracking office attendance. All data is stored in the browser via localStorage.

## Features

- 📅 Interactive calendar for toggling attendance dates
- 📊 Real-time statistics (current month + rolling 13-week totals)
- 💾 Backup/restore functionality (JSON export/import)
- 📱 Fully responsive design
- 🎨 Clean, modern UI with shadcn/ui components
- ✨ No backend required - 100% client-side

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Calendar, Button, Card)
- **State Management:** Zustand with persist middleware
- **Date Handling:** date-fns
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173/attendanceTracker/`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm test        # Watch mode
npm run test:run # Run once
```

### Lint

```bash
npm run lint
```

## Deployment

This project is configured for GitHub Pages deployment:

1. Push to the `main` branch
2. GitHub Actions will automatically run tests and deploy to Pages
3. Configure GitHub repository Settings → Pages → Source to "GitHub Actions"

## Usage

1. **Toggle Attendance:** Click on any date in the calendar to mark/unmark attendance
2. **View Stats:** See current month count and rolling 13-week total in real-time
3. **Export Data:** Download your attendance data as JSON backup
4. **Import Data:** Restore from a backup file (choose to replace or merge)

## Data Storage

All attendance data is stored locally in your browser's localStorage under the key `attendance-storage`. No data leaves your device.

## License

MIT
