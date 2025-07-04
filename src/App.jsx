import React from 'react';
import AppRouter from './routes/AppRouter';
import ThemeManager from './contexts/ThemeManager.jsx';
import {ToastProvider} from "./contexts/ToastContext.jsx";

export default function App() {
    return (
        <ToastProvider>
            <div>
                {}
                <ThemeManager />
                <main>
                    <AppRouter />
                </main>
            </div>
        </ToastProvider>
    );
}
