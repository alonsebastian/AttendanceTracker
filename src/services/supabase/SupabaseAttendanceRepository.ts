import type { SupabaseClient } from '@supabase/supabase-js';
import type { AttendanceRepository } from '../interfaces';

/**
 * Supabase implementation of the AttendanceRepository interface.
 * Uses RPC functions for toggle and bulk operations to reduce round-trips.
 */
export class SupabaseAttendanceRepository implements AttendanceRepository {
  constructor(private supabase: SupabaseClient) {}

  async getDates(startDate: string, endDate: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('date')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch attendance dates: ${error.message}`);
    }

    return data.map((row) => row.date);
  }

  async getAllDates(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('date')
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch attendance dates: ${error.message}`);
    }

    return data.map((row) => row.date);
  }

  async addDate(date: string): Promise<boolean> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await this.supabase.from('attendance').insert({
      user_id: user.id,
      date,
    });

    if (error) {
      // Check if error is due to duplicate (primary key violation)
      if (error.code === '23505') {
        // Date already exists, not an error
        return true;
      }
      throw new Error(`Failed to add attendance date: ${error.message}`);
    }

    return true;
  }

  async removeDate(date: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('attendance')
      .delete()
      .eq('date', date);

    if (error) {
      throw new Error(`Failed to remove attendance date: ${error.message}`);
    }

    return true;
  }

  async toggleDate(date: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('toggle_attendance', {
      p_date: date,
    });

    if (error) {
      throw new Error(`Failed to toggle attendance date: ${error.message}`);
    }

    // RPC returns true if date was added, false if removed
    return data as boolean;
  }

  async exportAll(): Promise<string[]> {
    // exportAll is the same as getAllDates
    return this.getAllDates();
  }

  async importDates(dates: string[], mode: 'replace' | 'merge'): Promise<void> {
    const rpcFunction =
      mode === 'replace' ? 'import_attendance_replace' : 'import_attendance_merge';

    const { error } = await this.supabase.rpc(rpcFunction, {
      p_dates: dates,
    });

    if (error) {
      throw new Error(`Failed to import attendance dates: ${error.message}`);
    }
  }
}
