import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Цвета кнопки виджета доставки для каждой темы
const DELIVERY_BTN_COLORS = {
  dark: '#f97316',  // оранжевый для тёмной темы
  light: '#3b82f6', // синий для светлой темы
};

// Применяем цвет к уже существующей кнопке виджета через DOM
function applyDeliveryBtnColor(theme) {
  const color = DELIVERY_BTN_COLORS[theme] || DELIVERY_BTN_COLORS.dark;

  // Кнопка виджета — элемент .ec-calc--call или .call-ec-widget
  const btn = document.querySelector('.ec-calc--call, .call-ec-widget');
  if (btn) {
    btn.style.backgroundColor = color;
    btn.style.background = color;
  }

  // Кнопка "Рассчитать" внутри формы
  const submitBtn = document.getElementById('acCalcGetResult');
  if (submitBtn) {
    submitBtn.style.backgroundColor = color;
    submitBtn.style.background = color;
  }
}

// Загружаем скрипт один раз при старте с нужным цветом
function loadDeliveryScript(theme) {
  if (document.getElementById('dcsbl')) return; // уже загружен

  const color = DELIVERY_BTN_COLORS[theme] || DELIVERY_BTN_COLORS.dark;
  const script = document.createElement('script');
  script.id = 'dcsbl';
  script.src = `https://dostavka.sbl.su/api/delivery.js?comp=0&startCt=Реж&startCntr=RU&btnBg=${encodeURIComponent(color)}`;
  document.body.appendChild(script);
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  // Загружаем скрипт один раз при монтировании
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    loadDeliveryScript(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // При смене темы — меняем цвет кнопки напрямую через DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    // Небольшая задержка на случай если виджет ещё не отрисован
    const timer = setTimeout(() => {
      applyDeliveryBtnColor(theme);
    }, 300);

    return () => clearTimeout(timer);
  }, [theme]);

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
