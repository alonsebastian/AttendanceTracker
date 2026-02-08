-- ========================================
-- Office Attendance Tracker - Initial Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates attendance table with RLS policies and RPC functions
-- ========================================

-- ========================================
-- 1. Create attendance table
-- ========================================

CREATE TABLE attendance (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, date)
);

COMMENT ON TABLE attendance IS 'Stores user attendance dates for office tracking';
COMMENT ON COLUMN attendance.user_id IS 'References auth.users - the user who marked attendance';
COMMENT ON COLUMN attendance.date IS 'The date of office attendance (DATE type, timezone-agnostic)';
COMMENT ON COLUMN attendance.created_at IS 'Timestamp when attendance was first recorded';

-- ========================================
-- 2. Create indexes
-- ========================================

-- Optimizes range queries for stats (monthly count, rolling 13-week total)
-- DESC order supports efficient "most recent dates" queries
CREATE INDEX idx_attendance_user_date_range ON attendance (user_id, date DESC);

-- ========================================
-- 3. Enable Row Level Security
-- ========================================

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. Create RLS Policies
-- ========================================

-- Users can read their own attendance records
CREATE POLICY attendance_select_own
  ON attendance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own attendance records
CREATE POLICY attendance_insert_own
  ON attendance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own attendance records
CREATE POLICY attendance_delete_own
  ON attendance
  FOR DELETE
  USING (auth.uid() = user_id);

-- No UPDATE policy needed: composite PK makes rows immutable
-- To "update" a date, delete and re-insert (which is what toggle does)

-- ========================================
-- 5. Create RPC Functions
-- ========================================

-- Toggle attendance for a specific date
-- Returns: true if date was added, false if removed
CREATE OR REPLACE FUNCTION toggle_attendance(p_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_exists BOOLEAN;
BEGIN
  -- Get authenticated user ID
  v_user_id := auth.uid();

  -- Check authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if date already exists for this user
  SELECT EXISTS(
    SELECT 1 FROM attendance
    WHERE user_id = v_user_id AND date = p_date
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove the date
    DELETE FROM attendance
    WHERE user_id = v_user_id AND date = p_date;
    RETURN FALSE;
  ELSE
    -- Add the date
    INSERT INTO attendance (user_id, date)
    VALUES (v_user_id, p_date);
    RETURN TRUE;
  END IF;
END;
$$;

COMMENT ON FUNCTION toggle_attendance(DATE) IS 'Toggle attendance for a date. Returns true if added, false if removed.';

-- Bulk import with replace mode (delete all + insert new)
-- Returns: count of inserted dates
CREATE OR REPLACE FUNCTION import_attendance_replace(p_dates DATE[])
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_inserted INT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Security: Validate array is not NULL
  IF p_dates IS NULL THEN
    RAISE EXCEPTION 'Dates array cannot be NULL';
  END IF;

  -- Security: Limit array size (10,000 dates = ~27 years)
  IF array_length(p_dates, 1) > 10000 THEN
    RAISE EXCEPTION 'Too many dates. Maximum is 10,000.';
  END IF;

  -- Delete all existing dates for this user (atomic with insert)
  DELETE FROM attendance WHERE user_id = v_user_id;

  -- Insert new dates (deduplicated via DISTINCT, NULL values filtered)
  INSERT INTO attendance (user_id, date)
  SELECT v_user_id, unnest_date
  FROM (SELECT DISTINCT unnest(p_dates) AS unnest_date) AS dates
  WHERE unnest_date IS NOT NULL
  ON CONFLICT (user_id, date) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  RETURN v_inserted;
END;
$$;

COMMENT ON FUNCTION import_attendance_replace(DATE[]) IS 'Replace all attendance dates with new set. Returns count inserted.';

-- Bulk import with merge mode (upsert)
-- Returns: count of newly inserted dates (excludes duplicates)
CREATE OR REPLACE FUNCTION import_attendance_merge(p_dates DATE[])
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_inserted INT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Security: Validate array is not NULL
  IF p_dates IS NULL THEN
    RAISE EXCEPTION 'Dates array cannot be NULL';
  END IF;

  -- Security: Limit array size
  IF array_length(p_dates, 1) > 10000 THEN
    RAISE EXCEPTION 'Too many dates. Maximum is 10,000.';
  END IF;

  -- Insert dates, skip duplicates (NULL values filtered)
  INSERT INTO attendance (user_id, date)
  SELECT v_user_id, unnest_date
  FROM (SELECT DISTINCT unnest(p_dates) AS unnest_date) AS dates
  WHERE unnest_date IS NOT NULL
  ON CONFLICT (user_id, date) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  RETURN v_inserted;
END;
$$;

COMMENT ON FUNCTION import_attendance_merge(DATE[]) IS 'Merge new dates with existing. Returns count of new dates inserted.';

-- ========================================
-- 6. Grant Permissions
-- ========================================

GRANT EXECUTE ON FUNCTION toggle_attendance(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION import_attendance_replace(DATE[]) TO authenticated;
GRANT EXECUTE ON FUNCTION import_attendance_merge(DATE[]) TO authenticated;
