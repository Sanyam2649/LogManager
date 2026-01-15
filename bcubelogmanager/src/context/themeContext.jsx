import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext(null);

export default function ToggleThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return sessionStorage.getItem('theme') || 'light';
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('theme', theme);
    setMounted(true);
  }, [theme]);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
