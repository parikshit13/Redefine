import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { apiFetch } from '../lib/api';

function todayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface HabitWithStreaks {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  timeLabel: string | null;
  frequency: string;
  days: string;
  reminderTime: string | null;
  reminderEnabled: boolean | null;
  goalCount: number | null;
  goalDuration: number | null;
  isArchived: boolean | null;
  createdAt: string;
  updatedAt: string;
  completedToday: boolean;
  currentStreak: number;
  bestStreak: number;
}

export function useHabits(onError?: (msg: string) => void) {
  const { getToken } = useAuth();
  const [habits, setHabits] = useState<HabitWithStreaks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const surfaceError = useCallback((msg: string) => {
    setError(msg);
    onErrorRef.current?.(msg);
  }, []);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      const today = todayDateStr();
      const data = await apiFetch<HabitWithStreaks[]>(
        `/api/habits?today=${today}`,
        {},
        token,
      );
      setHabits(data);
    } catch (err: any) {
      surfaceError(err.message || 'Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, surfaceError]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createHabit = useCallback(
    async (habit: {
      name: string;
      icon?: string;
      color?: string;
      timeLabel?: string;
      frequency?: string;
      days?: string;
      reminderTime?: string | null;
      reminderEnabled?: boolean;
      goalCount?: number;
      goalDuration?: number;
    }) => {
      const token = await getToken();
      await apiFetch('/api/habits', {
        method: 'POST',
        body: JSON.stringify(habit),
      }, token);
      await refetch();
    },
    [getToken, refetch],
  );

  const toggleCompletion = useCallback(
    async (habitId: string, date?: string) => {
      const today = date || todayDateStr();

      // Optimistic update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, completedToday: !h.completedToday } : h,
        ),
      );

      try {
        const token = await getToken();
        await apiFetch('/api/completions', {
          method: 'POST',
          body: JSON.stringify({ habitId, date: today }),
        }, token);
        // Refetch to get accurate streak counts
        await refetch();
      } catch (err: any) {
        // Revert on failure
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habitId ? { ...h, completedToday: !h.completedToday } : h,
          ),
        );
        surfaceError(err.message || 'Failed to update completion');
      }
    },
    [getToken, refetch, surfaceError],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        const token = await getToken();
        await apiFetch(`/api/habits/${id}`, {
          method: 'DELETE',
        }, token);
        await refetch();
      } catch (err: any) {
        surfaceError(err.message || 'Failed to delete habit');
        throw err;
      }
    },
    [getToken, refetch, surfaceError],
  );

  return { habits, isLoading, error, createHabit, toggleCompletion, deleteHabit, refetch };
}
