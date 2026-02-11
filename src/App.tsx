import './App.css';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ServiceProvider } from './services/ServiceContext';
import { supabase } from './services/supabase/client';
import { SupabaseAuthProvider } from './services/supabase/SupabaseAuthProvider';
import { SupabaseAttendanceRepository } from './services/supabase/SupabaseAttendanceRepository';
import { AuthGuard } from './components/AuthGuard';
import { LoginPage } from './pages/LoginPage';
import Layout from './components/Layout';

// Initialize service implementations
const auth = new SupabaseAuthProvider(supabase);
const attendance = new SupabaseAttendanceRepository(supabase);

/**
 * Handle GitHub Pages SPA redirect
 * Checks sessionStorage for redirect path set by 404.html
 */
function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = sessionStorage.getItem('githubPagesRedirect');
    if (redirect) {
      sessionStorage.removeItem('githubPagesRedirect');
      // Redirect should be relative to basename, but strip it defensively
      const basename = '/AttendanceTracker';
      const relativePath = redirect.startsWith(basename)
        ? redirect.substring(basename.length) || '/'
        : redirect;
      navigate(relativePath, { replace: true });
    }
  }, [navigate]);

  return null;
}

function App() {
  return (
    <ServiceProvider auth={auth} attendance={attendance}>
      <BrowserRouter basename="/AttendanceTracker">
        <RedirectHandler />
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected route */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster position="top-center" richColors />
    </ServiceProvider>
  );
}

export default App;
