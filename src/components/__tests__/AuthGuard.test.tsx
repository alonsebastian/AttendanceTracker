import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../AuthGuard';
import * as ServiceContext from '../../services/ServiceContext';
import type { AuthProvider, Session } from '../../services/interfaces';

describe('AuthGuard', () => {
  let mockAuth: AuthProvider;

  beforeEach(() => {
    mockAuth = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      resetPassword: vi.fn(),
    };

    vi.spyOn(ServiceContext, 'useAuth').mockReturnValue(mockAuth);
  });

  const renderAuthGuard = (initialRoute = '/') => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AuthGuard>
                <div>Protected Content</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </BrowserRouter>
    );
  };

  describe('Loading State', () => {
    it('should show loading spinner while checking session', async () => {
      let resolveSession: (value: Session | null) => void;
      const sessionPromise = new Promise<Session | null>((resolve) => {
        resolveSession = resolve;
      });

      vi.mocked(mockAuth.getSession).mockReturnValue(sessionPromise);
      vi.mocked(mockAuth.onAuthStateChange).mockReturnValue(() => {});

      renderAuthGuard();

      // Should show loading spinner
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Resolve session
      resolveSession!({ userId: '123', email: 'test@example.com' });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User', () => {
    it('should render protected content when session exists', async () => {
      vi.mocked(mockAuth.getSession).mockResolvedValue({
        userId: '123',
        email: 'test@example.com',
      });
      vi.mocked(mockAuth.onAuthStateChange).mockReturnValue(() => {});

      renderAuthGuard();

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });

      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should call getSession on mount', async () => {
      vi.mocked(mockAuth.getSession).mockResolvedValue({
        userId: '123',
        email: 'test@example.com',
      });
      vi.mocked(mockAuth.onAuthStateChange).mockReturnValue(() => {});

      renderAuthGuard();

      await waitFor(() => {
        expect(mockAuth.getSession).toHaveBeenCalled();
      });
    });

    it('should subscribe to auth state changes', async () => {
      vi.mocked(mockAuth.getSession).mockResolvedValue({
        userId: '123',
        email: 'test@example.com',
      });
      vi.mocked(mockAuth.onAuthStateChange).mockReturnValue(() => {});

      renderAuthGuard();

      await waitFor(() => {
        expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
      });
    });
  });

  describe('Unauthenticated User', () => {
    it('should redirect to login when no session exists', async () => {
      vi.mocked(mockAuth.getSession).mockResolvedValue(null);
      vi.mocked(mockAuth.onAuthStateChange).mockReturnValue(() => {});

      renderAuthGuard();

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect when session check fails', async () => {
      vi.mocked(mockAuth.getSession).mockRejectedValue(new Error('Network error'));
      vi.mocked(mockAuth.onAuthStateChange).mockReturnValue(() => {});

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderAuthGuard();

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Session check failed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Auth State Changes', () => {
    it('should update when user signs in', async () => {
      let authStateChangeCallback: (session: Session | null) => void;

      vi.mocked(mockAuth.getSession).mockResolvedValue(null);
      vi.mocked(mockAuth.onAuthStateChange).mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return () => {};
      });

      renderAuthGuard();

      // Initially should show login page
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });

      // Simulate user signing in
      authStateChangeCallback!({ userId: '123', email: 'test@example.com' });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should update when user signs out', async () => {
      let authStateChangeCallback: (session: Session | null) => void;

      vi.mocked(mockAuth.getSession).mockResolvedValue({
        userId: '123',
        email: 'test@example.com',
      });
      vi.mocked(mockAuth.onAuthStateChange).mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return () => {};
      });

      renderAuthGuard();

      // Initially should show protected content
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });

      // Simulate user signing out
      authStateChangeCallback!(null);

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', async () => {
      const mockUnsubscribe = vi.fn();

      vi.mocked(mockAuth.getSession).mockResolvedValue({
        userId: '123',
        email: 'test@example.com',
      });
      vi.mocked(mockAuth.onAuthStateChange).mockReturnValue(mockUnsubscribe);

      const { unmount } = renderAuthGuard();

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
