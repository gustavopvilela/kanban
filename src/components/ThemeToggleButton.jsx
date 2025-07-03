import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../features/themeSlice'; // Importa a ação do Redux
import { IconMoon, IconSun } from '@tabler/icons-react';
import './styles/ThemeToggleButton.css';

const ThemeToggleButton = () => {
    // Lê o tema diretamente do estado do Redux
    const theme = useSelector((state) => state.theme.theme);
    const dispatch = useDispatch();

    // Função para despachar a ação de troca de tema
    const handleToggleTheme = () => {
        dispatch(toggleTheme());
    };

    return (
        <button
            onClick={handleToggleTheme}
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
