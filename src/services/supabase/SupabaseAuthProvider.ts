import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthProvider, AuthResult, Session } from '../interfaces';

/**
 * Supabase implementation of the AuthProvider interface.
 * Handles user authentication, session management, and password reset.
 */
export class SupabaseAuthProvider implements AuthProvider {
  constructor(private supabase: SupabaseClient) {}

  async signUp(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: this.formatAuthError(error.message),
      };
    }

    return { success: true };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: this.formatAuthError(error.message),
      };
    }

    return { success: true };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  async getSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      return null;
    }

    return {
      userId: session.user.id,
      email: session.user.email || '',
    };
  }

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        callback(null);
      } else {
        callback({
          userId: session.user.id,
          email: session.user.email || '',
        });
      }
    });

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/attendanceTracker/reset-password`,
    });

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Format Supabase auth errors into user-friendly messages.
   */
  private formatAuthError(message: string): string {
    // Map common Supabase auth errors to user-friendly messages
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password.';
    }

    if (message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }

    if (message.includes('Email not confirmed')) {
      return 'Please confirm your email address before signing in.';
    }

    if (message.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }

    // Return original message for unexpected errors
    return message;
  }
}
