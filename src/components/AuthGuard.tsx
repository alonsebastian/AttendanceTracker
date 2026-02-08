import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/ServiceContext';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard component.
 * Protects routes by checking for an authenticated session.
 * Redirects to /login if no session exists.
 * Shows loading spinner while checking session.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const session = await auth.getSession();
        setIsAuthenticated(session !== null);
      } catch (error) {
        console.error('Session check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChange((session) => {
      setIsAuthenticated(session !== null);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
