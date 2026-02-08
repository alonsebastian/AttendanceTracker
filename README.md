# Office Attendance Tracker

A modern single-page application for tracking office attendance with cloud synchronization and multi-device support.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password authentication with session management
- ☁️ **Cloud Sync** - Access your data from any device
- 📅 **Interactive Calendar** - Click to toggle attendance dates with instant feedback
- 📊 **Real-time Statistics** - Current month count + rolling 13-week totals
- 💾 **Backup/Restore** - Export and import attendance data as JSON
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Clean interface with dark mode support
- ⚡ **Optimistic Updates** - Instant UI feedback with automatic error rollback
- 🔒 **Privacy First** - Row-level security ensures data isolation

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Backend:** Supabase (PostgreSQL + Auth)
- **Date Handling:** date-fns
- **Testing:** Vitest + React Testing Library
- **Deployment:** GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Supabase account (free tier works great)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd attendanceTracker
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, navigate to **Settings → API**
3. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Verify tables and policies were created successfully

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5174/attendanceTracker/`

## 🧪 Testing

```bash
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run lint       # Run ESLint
```

**Test Coverage:** 91% (81 passing tests)

## 📦 Building for Production

```bash
npm run build      # Creates optimized production build
npm run preview    # Preview production build locally
```

## 🚢 Deployment

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

#### Setup:

1. **Configure GitHub Repository Secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add `VITE_SUPABASE_URL` with your Supabase project URL
   - Add `VITE_SUPABASE_ANON_KEY` with your anon key

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: "GitHub Actions"

3. **Deploy:**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy

⚠️ **Security:** Only use the **anon/public** key for client-side deployment. Never expose your service role key.

## 📖 Usage

### First Time Setup

1. **Sign Up:** Create an account with your email and password
2. **Sign In:** Access your attendance tracker
3. **Start Tracking:** Click calendar dates to mark attendance

### Features

- **Toggle Attendance:** Click any date to mark/unmark
- **View Statistics:** Auto-updated monthly and 13-week totals
- **Export Data:** Download JSON backup for safekeeping
- **Import Data:** Restore from backup (replace or merge modes)
- **Multi-Device Sync:** Sign in from any device to access your data
- **Dark Mode:** Toggle in the header

## 🏗️ Architecture

### Security Model

- **Authentication:** Supabase Auth with email/password
- **Authorization:** Row-Level Security (RLS) policies enforce data isolation
- **Data Access:** Vendor-agnostic repository pattern for easy backend swapping
- **Client-Side:** Optimistic updates with automatic error recovery

### Data Flow

1. User authenticates via Supabase Auth
2. App hydrates attendance data from database on login
3. Date toggles update UI instantly (optimistic)
4. Changes persist to database in background
5. Errors automatically rollback UI state

## 🔒 Security Features

- ✅ Row-Level Security (RLS) policies prevent unauthorized access
- ✅ Secure RPC functions with input validation
- ✅ Protection against SQL injection
- ✅ DoS protection (10,000 date limit per user)
- ✅ Prototype pollution prevention in import/export
- ✅ CSRF protection via Supabase session tokens
- ✅ Secure password reset flow

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Supabase](https://supabase.com/) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

## 📞 Support

Found a bug? Have a feature request? Please open an issue on GitHub.

---

**Note:** This is a personal attendance tracking tool. For team/enterprise use, consider implementing additional features like team views, admin controls, and audit logs.
