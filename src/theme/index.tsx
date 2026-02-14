import { createContext, useContext, ReactNode } from 'react';

export type ThemeName = 'dark' | 'light';

export type ThemePalette = {
  background: string;
  card: string;
  surface: string;
  border: string;
  overlay: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  accentContrast: string;
  danger: string;
  dangerBorder: string;
  success: string;
  successBorder: string;
  successText: string;
  searchBackground: string;
  searchClearBackground: string;
  sheetBackground: string;
};

export const THEMES: Record<ThemeName, ThemePalette> = {
  dark: {
    background: '#020617',
    card: '#0f172a',
    surface: '#0b1220',
    border: '#1e293b',
    overlay: 'rgba(2, 6, 23, 0.4)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#38bdf8',
    accentSoft: 'rgba(56, 189, 248, 0.15)',
    accentStrong: '#1d4ed8',
    accentContrast: '#031122',
    danger: '#fb7185',
    dangerBorder: '#fecdd3',
    success: '#34d399',
    successBorder: '#bbf7d0',
    successText: '#064e3b',
    searchBackground: '#0b1220cc',
    searchClearBackground: '#1e293b',
    sheetBackground: '#020617ee',
  },
  light: {
    background: '#f8fafc',
    card: '#ffffff',
    surface: '#fff8f0',
    border: '#e2e8f0',
    overlay: 'rgba(248, 250, 252, 0.65)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accent: '#2563eb',
    accentSoft: 'rgba(37, 99, 235, 0.12)',
    accentStrong: '#1d4ed8',
    accentContrast: '#f8fafc',
    danger: '#f87171',
    dangerBorder: '#fecaca',
    success: '#10b981',
    successBorder: '#a7f3d0',
    successText: '#064e3b',
    searchBackground: '#edf2ff',
    searchClearBackground: '#e2e8f0',
    sheetBackground: '#ffffffee',
  },
};

type ThemeContextValue = {
  name: ThemeName;
  palette: ThemePalette;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ProviderProps = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  children: ReactNode;
};

export function ThemeProvider({ theme, setTheme, children }: ProviderProps) {
  return (
    <ThemeContext.Provider value={{ name: theme, palette: THEMES[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
