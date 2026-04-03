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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const fetchingRef = useRef(false);

  const surfaceError = useCallback((msg: string) => {
    setError(msg);
    onErrorRef.current?.(msg);
  }, []);

  const refetch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setError(null);
      const token = await getTokenRef.current();
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
      setIsRefreshing(false);
      fetchingRef.current = false;
    }
  }, [surfaceError]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
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
      const token = await getTokenRef.current();
      const created = await apiFetch<HabitWithStreaks>('/api/habits', {
        method: 'POST',
        body: JSON.stringify(habit),
      }, token);
      // Append to local state immediately with default streak values
      setHabits((prev) => [
        ...prev,
        {
          ...created,
          completedToday: created.completedToday ?? false,
          currentStreak: created.currentStreak ?? 0,
          bestStreak: created.bestStreak ?? 0,
        },
      ]);
      // Background refetch for accurate server state
      refetch();
      return created;
    },
    [refetch],
  );

  const toggleCompletion = useCallback(
    async (habitId: string, date?: string) => {
      const today = date || todayDateStr();

      // Optimistic update — flip completedToday and adjust streak
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          const nowCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: nowCompleted,
            currentStreak: nowCompleted
              ? h.currentStreak + 1
              : Math.max(0, h.currentStreak - 1),
          };
        }),
      );

      try {
        const token = await getTokenRef.current();
        await apiFetch('/api/completions', {
          method: 'POST',
          body: JSON.stringify({ habitId, date: today }),
        }, token);
        // Background refetch for accurate streak counts
        refetch();
      } catch (err: any) {
        // Revert on failure
        setHabits((prev) =>
          prev.map((h) => {
            if (h.id !== habitId) return h;
            const reverted = !h.completedToday;
            return {
              ...h,
              completedToday: reverted,
              currentStreak: reverted
                ? h.currentStreak + 1
                : Math.max(0, h.currentStreak - 1),
            };
          }),
        );
        surfaceError(err.message || 'Failed to update completion');
      }
    },
    [refetch, surfaceError],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      // Optimistic removal
      const snapshot = habits;
      setHabits((prev) => prev.filter((h) => h.id !== id));

      try {
        const token = await getTokenRef.current();
        await apiFetch(`/api/habits/${id}`, {
          method: 'DELETE',
        }, token);
        // Background refetch
        refetch();
      } catch (err: any) {
        // Revert on failure
        setHabits(snapshot);
        surfaceError(err.message || 'Failed to delete habit');
        throw err;
      }
    },
    [habits, refetch, surfaceError],
  );

  return { habits, isLoading, isRefreshing, error, createHabit, toggleCompletion, deleteHabit, refetch, refresh };
}
