import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import {BrowserRouter, HashRouter} from 'react-router-dom';
import App from './App';
import store, {persistor} from './store';
import './styles/globals.css';
import LoadingSpinner from "./components/LoadingSpinner.jsx";

//const basename = import.meta.env.PROD ? '/kanban' : '/kanban';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={<LoadingSpinner message="Carregando dados..." />} persistor={persistor}>
                <HashRouter>
                    <App />
                </HashRouter>
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
