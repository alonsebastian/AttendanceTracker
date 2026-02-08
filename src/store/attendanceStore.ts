import { create } from 'zustand';
import type { AttendanceRepository } from '../services/interfaces';

interface AttendanceState {
  // Data
  dates: string[];

  // Loading and error state
  isLoading: boolean;
  error: string | null;

  // Repository (injected after creation)
  _repository: AttendanceRepository | null;

  // Actions
  setRepository: (repository: AttendanceRepository) => void;
  hydrate: () => Promise<void>;
  toggleDate: (date: string) => Promise<void>;
  isPresent: (date: string) => boolean;
  replaceAll: (dates: string[]) => void;
  mergeWith: (dates: string[]) => void;
  clearAll: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  // Initial state
  dates: [],
  isLoading: false,
  error: null,
  _repository: null,

  /**
   * Inject the attendance repository.
   * Must be called before using async actions (hydrate, toggleDate).
   */
  setRepository: (repository: AttendanceRepository) => {
    set({ _repository: repository });
  },

  /**
   * Load all attendance dates from the repository.
   * Sets isLoading during the operation.
   */
  hydrate: async () => {
    const { _repository } = get();

    if (!_repository) {
      console.error('Repository not initialized. Call setRepository first.');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const dates = await _repository.getAllDates();
      set({ dates, isLoading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load attendance data';
      set({ error: errorMessage, isLoading: false });
      console.error('Hydration error:', err);
    }
  },

  /**
   * Toggle an attendance date with optimistic update.
   * Immediately updates UI, then persists to repository.
   * Rolls back on error.
   */
  toggleDate: async (date: string) => {
    const { _repository, dates } = get();

    if (!_repository) {
      console.error('Repository not initialized. Call setRepository first.');
      return;
    }

    // Optimistic update
    const exists = dates.includes(date);
    const newDates = exists ? dates.filter((d) => d !== date) : [...dates, date];

    set({ dates: newDates, error: null });

    try {
      // Persist to repository
      await _repository.toggleDate(date);
    } catch (err) {
      // Rollback on error
      set({ dates, error: 'Failed to update attendance. Please try again.' });
      console.error('Toggle error:', err);

      // Re-throw so UI can show error toast
      throw err;
    }
  },

  /**
   * Check if a date is marked as present.
   */
  isPresent: (date: string) => {
    return get().dates.includes(date);
  },

  /**
   * Replace all dates (used for import).
   */
  replaceAll: (dates: string[]) => {
    const uniqueDates = Array.from(new Set(dates));
    set({ dates: uniqueDates });
  },

  /**
   * Merge new dates with existing (used for import).
   */
  mergeWith: (dates: string[]) => {
    set((state) => {
      const combined = Array.from(new Set([...state.dates, ...dates]));
      return { dates: combined };
    });
  },

  /**
   * Clear all state (used on sign-out).
   */
  clearAll: () => {
    set({ dates: [], isLoading: false, error: null });
  },
}));
