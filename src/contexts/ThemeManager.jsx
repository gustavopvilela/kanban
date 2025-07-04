import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Este componente não renderiza nada. A sua única função é
// ouvir as mudanças no estado do tema no Redux e aplicar a classe CSS correta.
export default function ThemeManager() {
    const theme = useSelector((state) => state.theme.theme);

    useEffect(() => {
        const root = document.documentElement;
        root.className = ''; // Limpa classes antigas
        root.classList.add(theme); // Adiciona a classe do tema atual ('light' ou 'dark')
    }, [theme]); // Executa sempre que o tema mudar

    return null;
}
