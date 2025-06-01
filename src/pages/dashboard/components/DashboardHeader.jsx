import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import ThemeToggleButton from '../../../components/ThemeToggleButton.jsx';

export default function DashboardHeader({ onAddBoard }) {
    return (
        <div className="dashboard-header">
            <div className="dashboard-title-section">
                <h1 className="dashboard-title">Meus Quadros Kanban</h1>
                <p className="dashboard-subtitle">
                    Organize seus projetos e acompanhe o progresso de suas tarefas
                </p>
            </div>

            <button
                onClick={onAddBoard}
                className="dashboard-add-btn"
                aria-label="Criar novo quadro"
            >
                <IconPlus stroke={2} /> Novo quadro
            </button>

            <ThemeToggleButton />
        </div>
    );
}
