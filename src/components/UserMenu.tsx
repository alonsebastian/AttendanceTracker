import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/ServiceContext';
import { useAttendanceStore } from '../store/attendanceStore';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

/**
 * UserMenu component.
 * Shows user email and sign-out button in the header.
 */
export function UserMenu() {
  const [email, setEmail] = useState<string>('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const clearAll = useAttendanceStore((state) => state.clearAll);

  // Load user email on mount
  useState(() => {
    auth.getSession().then((session) => {
      if (session) {
        setEmail(session.email);
      }
    });
  });

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await auth.signOut();
      clearAll(); // Clear local state
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* User email */}
      {email && (
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{email}</span>
        </div>
      )}

      {/* Sign out button */}
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        disabled={isSigningOut}
      >
        <LogOut className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </span>
      </Button>
    </div>
  );
}
