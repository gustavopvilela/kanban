import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './features/boardsSlice';

const store = configureStore({
    reducer: {
        boards: boardsReducer
    }
});

export default store;