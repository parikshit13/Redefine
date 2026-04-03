import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { apiFetch } from '../lib/api';

export interface CompletionRecord {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean | null;
  createdAt: string;
}

export function useCompletions() {
  const { getToken } = useAuth();
  const [completions, setCompletions] = useState<CompletionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRange = useCallback(
    async (from: string, to: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const token = await getToken();
        const data = await apiFetch<CompletionRecord[]>(
          `/api/completions?from=${from}&to=${to}`,
          {},
          token,
        );
        setCompletions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [getToken],
  );

  return { completions, isLoading, error, fetchRange };
}
