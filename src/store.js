import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './features/boardsSlice';
import themeReducer from './features/themeSlice';

function debounce (func, wait) {
    let timeout;
    return function executedFunction (...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    }
}

// Função para carregar o estado COMPLETO do localStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('appState');
        if (serializedState === null) {
            return undefined; // Não há estado guardado, usa os reducers para o estado inicial
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error("Não foi possível carregar o estado do localStorage", err);
        return undefined;
    }
};

// Função para guardar o estado COMPLETO no localStorage
const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('appState', serializedState);
    } catch (err) {
        console.error("Não foi possível guardar o estado no localStorage", err);
    }
};

const preloadedState = loadState();

const store = configureStore({
    reducer: {
        boards: boardsReducer,
        theme: themeReducer // Adiciona o reducer do tema
    },
    preloadedState // Define o estado inicial da aplicação com os dados do localStorage
});

const debouncedSaveState = debounce(() => {
    saveState(store.getState());
}, 500);

// "Ouve" todas as alterações no store e guarda o estado completo
store.subscribe(() => {
    debouncedSaveState();
});

export default store;
