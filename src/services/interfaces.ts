/**
 * Service layer interfaces for the Office Attendance Tracker.
 * These interfaces provide vendor-agnostic abstractions for authentication and data access.
 */

/**
 * Repository interface for attendance data operations.
 * All dates are in YYYY-MM-DD format (local timezone, no UTC conversion).
 */
export interface AttendanceRepository {
  /**
   * Fetch attendance dates within a date range (inclusive).
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Array of date strings in YYYY-MM-DD format
   */
  getDates(startDate: string, endDate: string): Promise<string[]>;

  /**
   * Fetch all attendance dates for the current user.
   * @returns Array of date strings in YYYY-MM-DD format
   */
  getAllDates(): Promise<string[]>;

  /**
   * Add an attendance date.
   * @param date - Date in YYYY-MM-DD format
   * @returns true on success
   */
  addDate(date: string): Promise<boolean>;

  /**
   * Remove an attendance date.
   * @param date - Date in YYYY-MM-DD format
   * @returns true on success
   */
  removeDate(date: string): Promise<boolean>;

  /**
   * Toggle an attendance date.
   * @param date - Date in YYYY-MM-DD format
   * @returns true if date is now marked, false if removed
   */
  toggleDate(date: string): Promise<boolean>;

  /**
   * Export all attendance dates (for backup).
   * @returns Array of all dates in YYYY-MM-DD format
   */
  exportAll(): Promise<string[]>;

  /**
   * Import attendance dates in bulk.
   * @param dates - Array of dates in YYYY-MM-DD format
   * @param mode - 'replace' deletes all existing data first, 'merge' upserts
   */
  importDates(dates: string[], mode: 'replace' | 'merge'): Promise<void>;
}

/**
 * Authentication provider interface.
 * Handles user authentication, session management, and password reset.
 */
export interface AuthProvider {
  /**
   * Sign up a new user with email and password.
   * @param email - User's email address
   * @param password - User's password
   * @returns AuthResult with success status and optional error message
   */
  signUp(email: string, password: string): Promise<AuthResult>;

  /**
   * Sign in an existing user with email and password.
   * @param email - User's email address
   * @param password - User's password
   * @returns AuthResult with success status and optional error message
   */
  signIn(email: string, password: string): Promise<AuthResult>;

  /**
   * Sign out the current user.
   */
  signOut(): Promise<void>;

  /**
   * Get the current session.
   * @returns Session object if authenticated, null otherwise
   */
  getSession(): Promise<Session | null>;

  /**
   * Subscribe to authentication state changes.
   * @param callback - Function called when session changes (login/logout)
   * @returns Unsubscribe function to clean up the listener
   */
  onAuthStateChange(callback: (session: Session | null) => void): () => void;

  /**
   * Send a password reset email to the user.
   * @param email - User's email address
   */
  resetPassword(email: string): Promise<void>;
}

/**
 * Result of an authentication operation (sign in/sign up).
 */
export interface AuthResult {
  /** Whether the operation succeeded */
  success: boolean;

  /** Error message if operation failed */
  error?: string;
}

/**
 * User session information.
 */
export interface Session {
  /** Unique user identifier */
  userId: string;

  /** User's email address */
  email: string;
}
