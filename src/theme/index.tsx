import { createContext, useContext, ReactNode } from 'react';
import { THEME_COLORS } from '../constants/colors';

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
  dangerSoft: string;
  success: string;
  successBorder: string;
  successText: string;
  successSoft: string;
  searchBackground: string;
  searchClearBackground: string;
  sheetBackground: string;
};

export const THEMES: Record<ThemeName, ThemePalette> = {
  dark: { ...THEME_COLORS.dark },
  light: { ...THEME_COLORS.light },
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
