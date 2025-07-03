import React from 'react';
import AppRouter from './routes/AppRouter';
import ThemeManager from './components/ThemeManager'; // Importa o novo gestor

export default function App() {
    return (
        <div>
            {}
            <ThemeManager />
            <main>
                <AppRouter />
            </main>
        </div>
    );
}
