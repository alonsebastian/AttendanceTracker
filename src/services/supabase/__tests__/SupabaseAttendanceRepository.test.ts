import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAttendanceRepository } from '../SupabaseAttendanceRepository';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('SupabaseAttendanceRepository', () => {
  let mockSupabase: SupabaseClient;
  let repository: SupabaseAttendanceRepository;

  beforeEach(() => {
    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn(),
      rpc: vi.fn(),
      auth: {
        getUser: vi.fn(),
      },
    } as unknown as SupabaseClient;

    repository = new SupabaseAttendanceRepository(mockSupabase);
  });

  describe('getDates', () => {
    it('should fetch dates within a date range', async () => {
      const mockData = [{ date: '2025-01-15' }, { date: '2025-01-20' }];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      const result = await repository.getDates('2025-01-01', '2025-01-31');

      expect(result).toEqual(['2025-01-15', '2025-01-20']);
      expect(mockSupabase.from).toHaveBeenCalledWith('attendance');
      expect(mockQuery.select).toHaveBeenCalledWith('date');
      expect(mockQuery.gte).toHaveBeenCalledWith('date', '2025-01-01');
      expect(mockQuery.lte).toHaveBeenCalledWith('date', '2025-01-31');
      expect(mockQuery.order).toHaveBeenCalledWith('date', { ascending: true });
    });

    it('should throw error when query fails', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: '500' },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      await expect(repository.getDates('2025-01-01', '2025-01-31')).rejects.toThrow(
        'Failed to fetch attendance dates: Database error'
      );
    });
  });

  describe('getAllDates', () => {
    it('should fetch all dates for the user', async () => {
      const mockData = [
        { date: '2025-01-01' },
        { date: '2025-01-15' },
        { date: '2025-02-01' },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      const result = await repository.getAllDates();

      expect(result).toEqual(['2025-01-01', '2025-01-15', '2025-02-01']);
      expect(mockSupabase.from).toHaveBeenCalledWith('attendance');
      expect(mockQuery.select).toHaveBeenCalledWith('date');
      expect(mockQuery.order).toHaveBeenCalledWith('date', { ascending: true });
    });
  });

  describe('addDate', () => {
    it('should add a date successfully', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockQuery = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      const result = await repository.addDate('2025-01-15');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('attendance');
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        date: '2025-01-15',
      });
    });

    it('should return true if date already exists (duplicate key)', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockQuery = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key value' },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      const result = await repository.addDate('2025-01-15');

      expect(result).toBe(true);
    });

    it('should throw error when not authenticated', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(repository.addDate('2025-01-15')).rejects.toThrow('Not authenticated');
    });

    it('should throw error when insert fails', async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockQuery = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { code: '500', message: 'Database error' },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      await expect(repository.addDate('2025-01-15')).rejects.toThrow(
        'Failed to add attendance date: Database error'
      );
    });
  });

  describe('removeDate', () => {
    it('should remove a date successfully', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      const result = await repository.removeDate('2025-01-15');

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('attendance');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('date', '2025-01-15');
    });

    it('should throw error when delete fails', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      await expect(repository.removeDate('2025-01-15')).rejects.toThrow(
        'Failed to remove attendance date: Database error'
      );
    });
  });

  describe('toggleDate', () => {
    it('should call toggle RPC and return true when date is added', async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await repository.toggleDate('2025-01-15');

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('toggle_attendance', {
        p_date: '2025-01-15',
      });
    });

    it('should return false when date is removed', async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await repository.toggleDate('2025-01-15');

      expect(result).toBe(false);
    });

    it('should throw error when RPC fails', async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
      });

      await expect(repository.toggleDate('2025-01-15')).rejects.toThrow(
        'Failed to toggle attendance date: Not authenticated'
      );
    });
  });

  describe('exportAll', () => {
    it('should export all dates', async () => {
      const mockData = [{ date: '2025-01-01' }, { date: '2025-01-15' }];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockQuery as any);

      const result = await repository.exportAll();

      expect(result).toEqual(['2025-01-01', '2025-01-15']);
    });
  });

  describe('importDates', () => {
    it('should call replace RPC when mode is replace', async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: 5,
        error: null,
      });

      await repository.importDates(['2025-01-01', '2025-01-15'], 'replace');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('import_attendance_replace', {
        p_dates: ['2025-01-01', '2025-01-15'],
      });
    });

    it('should call merge RPC when mode is merge', async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: 3,
        error: null,
      });

      await repository.importDates(['2025-01-01', '2025-01-15'], 'merge');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('import_attendance_merge', {
        p_dates: ['2025-01-01', '2025-01-15'],
      });
    });

    it('should throw error when import fails', async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Too many dates', code: 'LIMIT_EXCEEDED' },
      });

      await expect(
        repository.importDates(['2025-01-01', '2025-01-15'], 'replace')
      ).rejects.toThrow('Failed to import attendance dates: Too many dates');
    });
  });
});
