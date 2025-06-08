import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { IconMoon, IconSun } from '@tabler/icons-react';
import './styles/ThemeToggleButton.css'

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            className={`theme-toggle-btn ${theme === 'light' ? '' : 'dark-active'}`}
        >
            <div className="flip-card">
                <div className="card-face card-front">
                    <span className="theme-icon sun-icon"><IconSun stroke={2} /></span>
                </div>
                <div className="card-face card-back">
                    <span className="theme-icon moon-icon"><IconMoon stroke={2} /></span>
                </div>
            </div>
        </button>

    );
};

export default ThemeToggleButton;