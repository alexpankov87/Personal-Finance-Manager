import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'gray' | 'blue';

interface ThemeContextType {
  theme: Theme;
  accentColor: string;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accentColors = {
  light: '#646cff',
  dark: '#3b82f6',
  gray: '#6b7280',
  blue: '#2563eb',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'light';
  });

  const [accentColor, setAccentColor] = useState<string>(() => {
    const saved = localStorage.getItem('accentColor');
    return saved || accentColors[theme];
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Обновляем переменную --button-bg
    document.documentElement.style.setProperty('--button-bg', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [theme, accentColor]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      // Сбрасываем акцентный цвет на дефолтный для новой темы
      setAccentColor(accentColors[next]);
      return next;
    });
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setAccentColor(accentColors[newTheme]);
  };

  const handleSetAccentColor = (color: string) => {
    setAccentColor(color);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      accentColor, 
      setTheme: handleSetTheme, 
      setAccentColor: handleSetAccentColor,
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};