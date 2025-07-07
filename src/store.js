import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import boardsReducer from "./features/boardsSlice.js";
import themeReducer from "./features/themeSlice.js";

const boardsPersistConfig = {
    key: 'boards',
    storage,
};

const themePersistConfig = {
    key: 'theme',
    storage,
};

const persistedBoardsReducer = persistReducer(boardsPersistConfig, boardsReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

const rootReducer = combineReducers({
    boards: persistedBoardsReducer,
    theme: persistedThemeReducer,
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
export default store;