import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme, Platform } from 'react-native';
import { colorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';

export const THEME = {
  light: {
    background: '#FFFFFF',
    foreground: '#0C0A09',
    card: '#FAFAFA',
    cardForeground: '#0C0A09',
    popover: '#FAFAFA',
    popoverForeground: '#0C0A09',
    primary: '#1D1816',
    primaryForeground: '#FBFAF9',
    secondary: '#F3F1F1',
    secondaryForeground: '#1D1816',
    muted: '#F3F1F1',
    mutedForeground: '#7C6D67',
    accent: '#F3F1F1',
    accentForeground: '#1D1816',
    destructive: '#E7000B',
    border: '#E8E4E3',
    input: '#E8E4E3',
    ring: '#ABA09C',
    chart1: '#FFB86A',
    chart2: '#FF6900',
    chart3: '#F54900',
    chart4: '#CA3500',
    chart5: '#9F2D00',
  },
  dark: {
    background: '#0C0A09',
    foreground: '#FBFAF9',
    card: '#1D1816',
    cardForeground: '#FBFAF9',
    popover: '#1D1816',
    popoverForeground: '#FBFAF9',
    primary: '#E8E4E3',
    primaryForeground: '#1D1816',
    secondary: '#2B2422',
    secondaryForeground: '#FBFAF9',
    muted: '#2B2422',
    mutedForeground: '#ABA09C',
    accent: '#2B2422',
    accentForeground: '#FBFAF9',
    destructive: '#FF6467',
    border: '#242424',
    input: '#2E2E2E',
    ring: '#7C6D67',
    chart1: '#FFB86A',
    chart2: '#FF6900',
    chart3: '#F54900',
    chart4: '#CA3500',
    chart5: '#9F2D00',
  },
} as const;

const withAlpha = (hex: string, alpha: number) =>
  hex +
  Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  themePreference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const THEME_STORAGE_KEY = 'spendly_theme_preference';

export async function getStoredThemePreference(): Promise<ThemePreference | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (val === 'light' || val === 'dark' || val === 'system') return val;
      }
      return null;
    }
    const val = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
    return null;
  } catch {
    return null;
  }
}

export async function setStoredThemePreference(mode: ThemePreference): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      }
      return;
    }
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
  } catch {}
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getStoredThemePreference().then((saved) => {
      if (isMounted) {
        const initial = saved || 'system';
        setThemePreferenceState(initial);
        colorScheme.set(initial);
        setIsLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    colorScheme.set(themePreference);
  }, [themePreference, deviceColorScheme, isLoaded]);

  const setThemePreference = async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    colorScheme.set(pref);
    await setStoredThemePreference(pref);
  };

  const resolvedTheme: 'light' | 'dark' =
    themePreference === 'system'
      ? deviceColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePreference;

  const isDark = resolvedTheme === 'dark';

  return React.createElement(
    ThemeContext.Provider,
    {
      value: {
        themePreference,
        resolvedTheme,
        isDark,
        setThemePreference,
      },
    },
    children
  );
}

export function useAppTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeColors() {
  const { resolvedTheme } = useAppTheme();
  return THEME[resolvedTheme];
}

export function useNavColors() {
  const { resolvedTheme, isDark } = useAppTheme();
  const t = THEME[resolvedTheme];

  return {
    background: t.card,
    border: t.border,
    active: t.chart2,
    inactive: t.mutedForeground,
    indicator: withAlpha(t.chart2, isDark ? 0.2 : 0.12),
    ripple: withAlpha(t.chart2, isDark ? 0.2 : 0.15),
  };
}
