import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import * as ServiceContext from '../../services/ServiceContext';
import type { AuthProvider } from '../../services/interfaces';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginPage', () => {
  let mockAuth: AuthProvider;

  beforeEach(() => {
    mockNavigate.mockClear();

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

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render sign in form by default', () => {
      renderLoginPage();

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should switch to sign up mode', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
    });

    it('should switch back to sign in mode', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      // Switch to sign up
      await user.click(screen.getByRole('button', { name: /sign up/i }));
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();

      // Switch back to sign in
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Sign In', () => {
    it('should sign in with valid credentials', async () => {
      const user = userEvent.setup();
      vi.mocked(mockAuth.signIn).mockResolvedValue({ success: true });

      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should show error for invalid credentials', async () => {
      const user = userEvent.setup();
      vi.mocked(mockAuth.signIn).mockResolvedValue({
        success: false,
        error: 'Invalid email or password.',
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during sign in', async () => {
      const user = userEvent.setup();
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });

      vi.mocked(mockAuth.signIn).mockReturnValue(signInPromise);

      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Button should show loading state
      expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();

      // Resolve sign in
      resolveSignIn!({ success: true });
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Sign Up', () => {
    it('should sign up with valid credentials', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');
      vi.mocked(mockAuth.signUp).mockResolvedValue({ success: true });

      renderLoginPage();

      // Switch to sign up mode
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));

      await waitFor(() => {
        expect(mockAuth.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      // Switch to sign up mode
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword');
      await user.click(screen.getByRole('button', { name: /^sign up$/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      expect(mockAuth.signUp).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      expect(mockAuth.signIn).not.toHaveBeenCalled();
    });

    it('should validate password length', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), '12345');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });

      expect(mockAuth.signIn).not.toHaveBeenCalled();
    });
  });

  describe('Forgot Password', () => {
    it('should send password reset email', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');
      vi.mocked(mockAuth.resetPassword).mockResolvedValue(undefined);

      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/forgot password/i));

      await waitFor(() => {
        expect(mockAuth.resetPassword).toHaveBeenCalledWith('test@example.com');
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.click(screen.getByText(/forgot password/i));

      await waitFor(() => {
        expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
      });

      expect(mockAuth.resetPassword).not.toHaveBeenCalled();
    });

    it('should validate email format for password reset', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.click(screen.getByText(/forgot password/i));

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      expect(mockAuth.resetPassword).not.toHaveBeenCalled();
    });
  });
});
