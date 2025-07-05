import React from 'react';
import { IconSun, IconMoon } from '@tabler/icons-react';
import './styles/ThemeToggleButton.css';
import {toggleTheme} from "../features/themeSlice.js";
import {useDispatch, useSelector} from "react-redux";

function ThemeToggleButton() {
    // Lê o tema diretamente do estado do Redux
    const theme = useSelector((state) => state.theme.theme);
    const dispatch = useDispatch();

    // Função para despachar a ação de troca de tema
    const handleToggleTheme = () => {
        dispatch(toggleTheme());
    };


    return (
        <button
            className="theme-toggle-button-menu"
            onClick={handleToggleTheme}
            aria-label={theme === "light" ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
            <div className="theme-show">
                <span>Tema</span>
                {theme === "light" ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
            </div>

        </button>
    );
}

export default ThemeToggleButton;