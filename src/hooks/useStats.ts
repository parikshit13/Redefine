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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const fetchingRef = useRef(false);

  const refetch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setError(null);
      const token = await getTokenRef.current();
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
      setIsRefreshing(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
  }, [refetch]);

  return { stats, isLoading, isRefreshing, error, refetch, refresh };
}
