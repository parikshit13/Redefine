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

export interface HabitStreak {
  habitId: string;
  name: string;
  color: string;
  currentStreak: number;
  bestStreak: number;
}

export interface Stats {
  currentOverallStreak: number;
  bestOverallStreak: number;
  completionRateThisMonth: number;
  totalCompletionsAllTime: number;
  habitStreaks: HabitStreak[];
  weeklyCompletion: number[];
  todayProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export function useStats(onError?: (msg: string) => void) {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      const today = todayDateStr();
      const data = await apiFetch<Stats>(
        `/api/stats?today=${today}`,
        {},
        token,
      );
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
      onErrorRef.current?.(err.message || 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}
