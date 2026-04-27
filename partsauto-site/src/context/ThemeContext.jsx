import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Инициализация темы из localStorage или по умолчанию 'dark'
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  // Применение темы при изменении
  useEffect(() => {
    const applyTheme = (themeName) => {
      document.documentElement.setAttribute('data-theme', themeName);
    };

    applyTheme(theme);
  }, [theme]);

  // Применение темы при первой загрузке
  useEffect(() => {
    const applyTheme = (themeName) => {
      document.documentElement.setAttribute('data-theme', themeName);
    };

    applyTheme(theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
