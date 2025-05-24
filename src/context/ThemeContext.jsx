import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => JSON.parse(localStorage.getItem('dark') || 'false'));

    useEffect(() => {
        document.body.classList.toggle('theme-dark', dark);
        localStorage.setItem('dark', JSON.stringify(dark));
    }, [dark]);

    const toggle = () => setDark(prev => !prev);

    return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);