import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/ServiceContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup';

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const isSignIn = mode === 'signin';
  const isSignUp = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetEmailSent(false);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Validate password confirmation for sign up
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const result = isSignIn
        ? await auth.signIn(email, password)
        : await auth.signUp(email, password);

      if (result.success) {
        if (isSignUp) {
          toast.success('Account created successfully! Please check your email to confirm your account.');
        } else {
          // Successful sign in - navigate to main app
          navigate('/');
        }
      } else {
        setError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetEmailSent(false);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await auth.resetPassword(email);
      setResetEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(isSignIn ? 'signup' : 'signin');
    setError('');
    setResetEmailSent(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}logo-light.png`}
            alt="OATs - Office Attendance Tracker"
            className="h-14 w-auto dark:hidden"
          />
          <img
            src={`${import.meta.env.BASE_URL}logo-dark.png`}
            alt="OATs - Office Attendance Tracker"
            className="h-14 w-auto hidden dark:block"
          />
        </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignIn ? 'Sign In' : 'Sign Up'}</CardTitle>
          <CardDescription>
            {isSignIn
              ? 'Sign in to access your attendance tracker'
              : 'Create an account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
                required
              />
            </div>

            {/* Confirm password field (sign up only) */}
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            {/* Reset email sent message */}
            {resetEmailSent && (
              <div className="text-sm text-accent-foreground bg-accent/20 border border-accent/30 rounded-md p-3">
                Password reset email sent! Please check your inbox.
              </div>
            )}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : isSignIn ? 'Sign In' : 'Sign Up'}
            </Button>

            {/* Forgot password link (sign in only) */}
            {isSignIn && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline w-full text-center"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            )}

            {/* Mode toggle */}
            <div className="text-center text-sm text-muted-foreground">
              {isSignIn ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                {isSignIn ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
