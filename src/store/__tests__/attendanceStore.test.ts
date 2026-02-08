import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAttendanceStore } from '../attendanceStore';
import type { AttendanceRepository } from '../../services/interfaces';

describe('attendanceStore', () => {
  let mockRepository: AttendanceRepository;

  beforeEach(() => {
    // Reset store state before each test
    useAttendanceStore.setState({
      dates: [],
      isLoading: false,
      error: null,
      _repository: null,
    });

    // Create mock repository
    mockRepository = {
      getAllDates: vi.fn(),
      getDates: vi.fn(),
      addDate: vi.fn(),
      removeDate: vi.fn(),
      toggleDate: vi.fn(),
      exportAll: vi.fn(),
      importDates: vi.fn(),
    };
  });

  describe('setRepository', () => {
    it('should set the repository', () => {
      const { setRepository } = useAttendanceStore.getState();
      setRepository(mockRepository);

      expect(useAttendanceStore.getState()._repository).toBe(mockRepository);
    });
  });

  describe('hydrate', () => {
    it('should load dates from repository', async () => {
      vi.mocked(mockRepository.getAllDates).mockResolvedValue([
        '2025-01-01',
        '2025-01-15',
        '2025-02-01',
      ]);

      const { setRepository, hydrate } = useAttendanceStore.getState();
      setRepository(mockRepository);

      await hydrate();

      const state = useAttendanceStore.getState();
      expect(state.dates).toEqual(['2025-01-01', '2025-01-15', '2025-02-01']);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state during hydration', async () => {
      let resolvePromise: (value: string[]) => void;
      const promise = new Promise<string[]>((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(mockRepository.getAllDates).mockReturnValue(promise);

      const { setRepository, hydrate } = useAttendanceStore.getState();
      setRepository(mockRepository);

      const hydratePromise = hydrate();

      // Check loading state during fetch
      expect(useAttendanceStore.getState().isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!(['2025-01-01']);
      await hydratePromise;

      // Check loading state after fetch
      expect(useAttendanceStore.getState().isLoading).toBe(false);
    });

    it('should set error state when hydration fails', async () => {
      vi.mocked(mockRepository.getAllDates).mockRejectedValue(
        new Error('Network error')
      );

      const { setRepository, hydrate } = useAttendanceStore.getState();
      setRepository(mockRepository);

      await hydrate();

      const state = useAttendanceStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
      expect(state.dates).toEqual([]);
    });

    it('should handle missing repository gracefully', async () => {
      const { hydrate } = useAttendanceStore.getState();
      // Don't set repository

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await hydrate();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Repository not initialized. Call setRepository first.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('toggleDate', () => {
    beforeEach(() => {
      const { setRepository } = useAttendanceStore.getState();
      setRepository(mockRepository);
    });

    it('should optimistically add date and persist', async () => {
      useAttendanceStore.setState({ dates: ['2025-01-01'] });
      vi.mocked(mockRepository.toggleDate).mockResolvedValue(true);

      const { toggleDate } = useAttendanceStore.getState();
      await toggleDate('2025-01-15');

      expect(useAttendanceStore.getState().dates).toEqual(['2025-01-01', '2025-01-15']);
      expect(mockRepository.toggleDate).toHaveBeenCalledWith('2025-01-15');
    });

    it('should optimistically remove date and persist', async () => {
      useAttendanceStore.setState({ dates: ['2025-01-01', '2025-01-15'] });
      vi.mocked(mockRepository.toggleDate).mockResolvedValue(false);

      const { toggleDate } = useAttendanceStore.getState();
      await toggleDate('2025-01-15');

      expect(useAttendanceStore.getState().dates).toEqual(['2025-01-01']);
      expect(mockRepository.toggleDate).toHaveBeenCalledWith('2025-01-15');
    });

    it('should rollback on error', async () => {
      useAttendanceStore.setState({ dates: ['2025-01-01'] });
      vi.mocked(mockRepository.toggleDate).mockRejectedValue(new Error('Network error'));

      const { toggleDate } = useAttendanceStore.getState();

      await expect(toggleDate('2025-01-15')).rejects.toThrow('Network error');

      // Should rollback to original state
      expect(useAttendanceStore.getState().dates).toEqual(['2025-01-01']);
      expect(useAttendanceStore.getState().error).toBe(
        'Failed to update attendance. Please try again.'
      );
    });

    it('should handle missing repository', async () => {
      useAttendanceStore.setState({ _repository: null });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { toggleDate } = useAttendanceStore.getState();
      await toggleDate('2025-01-15');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Repository not initialized. Call setRepository first.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('isPresent', () => {
    it('should return true if date is present', () => {
      useAttendanceStore.setState({ dates: ['2025-01-01', '2025-01-15'] });

      const { isPresent } = useAttendanceStore.getState();
      expect(isPresent('2025-01-15')).toBe(true);
    });

    it('should return false if date is not present', () => {
      useAttendanceStore.setState({ dates: ['2025-01-01'] });

      const { isPresent } = useAttendanceStore.getState();
      expect(isPresent('2025-01-15')).toBe(false);
    });
  });

  describe('replaceAll', () => {
    it('should replace all dates with deduplication', () => {
      useAttendanceStore.setState({ dates: ['2025-01-01'] });

      const { replaceAll } = useAttendanceStore.getState();
      replaceAll(['2025-02-01', '2025-02-15', '2025-02-01']);

      expect(useAttendanceStore.getState().dates).toEqual(['2025-02-01', '2025-02-15']);
    });
  });

  describe('mergeWith', () => {
    it('should merge dates with existing dates', () => {
      useAttendanceStore.setState({ dates: ['2025-01-01', '2025-01-15'] });

      const { mergeWith } = useAttendanceStore.getState();
      mergeWith(['2025-01-15', '2025-02-01']);

      expect(useAttendanceStore.getState().dates).toEqual([
        '2025-01-01',
        '2025-01-15',
        '2025-02-01',
      ]);
    });
  });

  describe('clearAll', () => {
    it('should clear all state', () => {
      useAttendanceStore.setState({
        dates: ['2025-01-01'],
        isLoading: true,
        error: 'Some error',
      });

      const { clearAll } = useAttendanceStore.getState();
      clearAll();

      const state = useAttendanceStore.getState();
      expect(state.dates).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
