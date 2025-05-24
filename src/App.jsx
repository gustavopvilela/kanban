import React from 'react';
import AppRouter from './routes/AppRouter';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
    return (
        <div className="app-container">
            {/*<header className="app-header">*/}
            {/*    <h1>Kanban Simples</h1>*/}
            {/*    <ThemeToggle />*/}
            {/*</header>*/}
            <main className="app-main">
                <AppRouter />
            </main>
        </div>
    );
}