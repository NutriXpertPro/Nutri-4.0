'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ColorTheme = 'monochrome' | 'teal' | 'blue' | 'violet' | 'pink' | 'amber' | 'emerald';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('teal');

  // Carregar tema de cores do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme && ['monochrome', 'teal', 'blue', 'violet', 'pink', 'amber', 'emerald'].includes(savedTheme)) {
      // eslint-disable-next-line
      setColorThemeState(savedTheme as ColorTheme);
    }
  }, []);

  // Aplicar classe CSS baseada no tema de cores
  useEffect(() => {
    document.documentElement.classList.remove(
      'theme-teal',
      'theme-blue',
      'theme-violet',
      'theme-pink',
      'theme-amber',
      'theme-emerald'
    );

    if (colorTheme !== 'monochrome') {
      document.documentElement.classList.add(`theme-${colorTheme}`);
    }

    // Salvar tema no localStorage
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
};