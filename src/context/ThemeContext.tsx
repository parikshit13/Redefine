import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/tokens';

export type AccentName = 'sage' | 'lavender' | 'peach' | 'sky' | 'rose';

const ACCENT_KEY = 'redefine_accent_color';

interface AccentColors {
  hex: string;
  dim: string;
  border: string;
  glow: string;
  trackOn: string;
}

const ACCENT_MAP: Record<AccentName, AccentColors> = {
  sage: {
    hex: colors.sage,
    dim: 'rgba(139,175,139,0.15)',
    border: 'rgba(139,175,139,0.12)',
    glow: 'rgba(139,175,139,0.20)',
    trackOn: 'rgba(139,175,139,0.50)',
  },
  lavender: {
    hex: colors.lavender,
    dim: 'rgba(169,155,204,0.15)',
    border: 'rgba(169,155,204,0.12)',
    glow: 'rgba(169,155,204,0.20)',
    trackOn: 'rgba(169,155,204,0.50)',
  },
  peach: {
    hex: colors.peach,
    dim: 'rgba(212,165,137,0.15)',
    border: 'rgba(212,165,137,0.12)',
    glow: 'rgba(212,165,137,0.20)',
    trackOn: 'rgba(212,165,137,0.50)',
  },
  sky: {
    hex: colors.sky,
    dim: 'rgba(123,175,212,0.15)',
    border: 'rgba(123,175,212,0.12)',
    glow: 'rgba(123,175,212,0.20)',
    trackOn: 'rgba(123,175,212,0.50)',
  },
  rose: {
    hex: colors.rose,
    dim: 'rgba(204,155,175,0.15)',
    border: 'rgba(204,155,175,0.12)',
    glow: 'rgba(204,155,175,0.20)',
    trackOn: 'rgba(204,155,175,0.50)',
  },
};

interface ThemeContextValue {
  accentName: AccentName;
  accent: AccentColors;
  setAccentName: (name: AccentName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  accentName: 'sage',
  accent: ACCENT_MAP.sage,
  setAccentName: () => {},
});

export function useAccent() {
  return useContext(ThemeContext);
}

export { ACCENT_MAP };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentName, setAccentNameState] = useState<AccentName>('sage');

  useEffect(() => {
    AsyncStorage.getItem(ACCENT_KEY).then((v) => {
      if (v && v in ACCENT_MAP) setAccentNameState(v as AccentName);
    });
  }, []);

  const setAccentName = useCallback((name: AccentName) => {
    setAccentNameState(name);
    AsyncStorage.setItem(ACCENT_KEY, name);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ accentName, accent: ACCENT_MAP[accentName], setAccentName }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
