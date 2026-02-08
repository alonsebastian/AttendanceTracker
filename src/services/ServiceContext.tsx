import { createContext, useContext, type ReactNode } from 'react';
import type { AuthProvider, AttendanceRepository } from './interfaces';

/**
 * Context for service layer dependency injection.
 * Provides auth and attendance services to the component tree.
 */
interface ServiceContextValue {
  auth: AuthProvider;
  attendance: AttendanceRepository;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

/**
 * Props for ServiceProvider component.
 */
interface ServiceProviderProps {
  auth: AuthProvider;
  attendance: AttendanceRepository;
  children: ReactNode;
}

/**
 * Service provider component.
 * Wraps the app root and provides auth and attendance services.
 *
 * @example
 * ```tsx
 * const auth = new SupabaseAuthProvider(supabase);
 * const attendance = new SupabaseAttendanceRepository(supabase);
 *
 * <ServiceProvider auth={auth} attendance={attendance}>
 *   <App />
 * </ServiceProvider>
 * ```
 */
export function ServiceProvider({ auth, attendance, children }: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={{ auth, attendance }}>
      {children}
    </ServiceContext.Provider>
  );
}

/**
 * Hook to access the auth service.
 * Must be used within a ServiceProvider.
 *
 * @throws Error if used outside ServiceProvider
 */
export function useAuth(): AuthProvider {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error('useAuth must be used within a ServiceProvider');
  }

  return context.auth;
}

/**
 * Hook to access the attendance repository.
 * Must be used within a ServiceProvider.
 *
 * @throws Error if used outside ServiceProvider
 */
export function useAttendance(): AttendanceRepository {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error('useAttendance must be used within a ServiceProvider');
  }

  return context.attendance;
}
