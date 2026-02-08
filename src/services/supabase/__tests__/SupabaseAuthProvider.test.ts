import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAuthProvider } from '../SupabaseAuthProvider';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('SupabaseAuthProvider', () => {
  let mockSupabase: SupabaseClient;
  let authProvider: SupabaseAuthProvider;

  beforeEach(() => {
    // Create a mock Supabase client
    mockSupabase = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
        resetPasswordForEmail: vi.fn(),
      },
    } as unknown as SupabaseClient;

    authProvider = new SupabaseAuthProvider(mockSupabase);
  });

  describe('signUp', () => {
    it('should return success when sign up succeeds', async () => {
      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' }, session: null },
        error: null,
      });

      const result = await authProvider.signUp('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error when user already exists', async () => {
      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', name: 'AuthError', status: 400 },
      });

      const result = await authProvider.signUp('existing@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An account with this email already exists.');
    });

    it('should return formatted error for weak password', async () => {
      vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Password should be at least 6 characters',
          name: 'AuthError',
          status: 400,
        },
      });

      const result = await authProvider.signUp('test@example.com', '123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters long.');
    });
  });

  describe('signIn', () => {
    it('should return success when credentials are valid', async () => {
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token', user: {} },
        },
        error: null,
      });

      const result = await authProvider.signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error when credentials are invalid', async () => {
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 },
      });

      const result = await authProvider.signIn('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password.');
    });

    it('should return error when email is not confirmed', async () => {
      vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed', name: 'AuthError', status: 400 },
      });

      const result = await authProvider.signIn('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please confirm your email address before signing in.');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({ error: null });

      await expect(authProvider.signOut()).resolves.toBeUndefined();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({
        error: { message: 'Network error', name: 'AuthError', status: 500 },
      });

      await expect(authProvider.signOut()).rejects.toThrow('Sign out failed: Network error');
    });
  });

  describe('getSession', () => {
    it('should return session when user is authenticated', async () => {
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            access_token: 'token',
          },
        },
        error: null,
      });

      const session = await authProvider.getSession();

      expect(session).toEqual({
        userId: '123',
        email: 'test@example.com',
      });
    });

    it('should return null when no session exists', async () => {
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const session = await authProvider.getSession();

      expect(session).toBeNull();
    });

    it('should return null when user has no email', async () => {
      vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            user: { id: '123', email: undefined },
            access_token: 'token',
          },
        },
        error: null,
      });

      const session = await authProvider.getSession();

      expect(session).toEqual({
        userId: '123',
        email: '',
      });
    });
  });

  describe('onAuthStateChange', () => {
    it('should call callback when auth state changes', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(mockSupabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      const unsubscribe = authProvider.onAuthStateChange(mockCallback);

      // Simulate auth state change
      const onAuthStateChangeCallback = vi.mocked(mockSupabase.auth.onAuthStateChange).mock
        .calls[0][0];
      onAuthStateChangeCallback('SIGNED_IN', {
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token',
      });

      expect(mockCallback).toHaveBeenCalledWith({
        userId: '123',
        email: 'test@example.com',
      });

      // Test unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback with null when user signs out', () => {
      const mockCallback = vi.fn();

      vi.mocked(mockSupabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      });

      authProvider.onAuthStateChange(mockCallback);

      // Simulate sign out
      const onAuthStateChangeCallback = vi.mocked(mockSupabase.auth.onAuthStateChange).mock
        .calls[0][0];
      onAuthStateChangeCallback('SIGNED_OUT', null);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      vi.mocked(mockSupabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      await expect(authProvider.resetPassword('test@example.com')).resolves.toBeUndefined();

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/attendanceTracker/reset-password'),
        })
      );
    });

    it('should throw error when reset fails', async () => {
      vi.mocked(mockSupabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: { message: 'Email not found', name: 'AuthError', status: 400 },
      });

      await expect(authProvider.resetPassword('test@example.com')).rejects.toThrow(
        'Password reset failed: Email not found'
      );
    });
  });
});
