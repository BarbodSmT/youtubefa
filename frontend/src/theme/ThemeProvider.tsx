'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { useServerInsertedHTML } from 'next/navigation';

const createRtlCache = () =>
  createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount to prevent hydration mismatch
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode) {
        setIsDarkMode(JSON.parse(savedMode));
      }
    } catch (error) {
      console.error("Could not parse dark mode from localStorage", error);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      try {
        localStorage.setItem('darkMode', JSON.stringify(newMode));
      } catch (error) {
        console.error("Could not save dark mode to localStorage", error);
      }
      return newMode;
    });
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Manage Emotion Cache for SSR to prevent FOUC (Huge Icons)
  const [{ cache, flush }] = useState(() => {
    const cache = createRtlCache();
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {/* Render children only after mount if sensitive to theme to avoid mismatch, 
              or render always if initial flash is acceptable. 
              Here we render always to ensure content availability for SEO. */}
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};