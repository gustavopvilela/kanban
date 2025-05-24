import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { dark, toggle } = useTheme();
    return (
        <button onClick={toggle} className="btn-theme">
            {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
}