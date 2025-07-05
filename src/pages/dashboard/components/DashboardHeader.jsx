import React from 'react';
import {IconPlus, IconSearch} from '@tabler/icons-react';
import ThemeToggleButton from '../../../components/ThemeToggleButton.jsx';
import SettingsMenu from "../../../components/SettingsMenu.jsx";

export default function DashboardHeader({ onAddBoard, searchQuery, onSearchChange }) {
    return (
        <div className="dashboard-header">
            <div className="dashboard-title-section">
                <h1 className="dashboard-title">Meus Quadros Kanban</h1>
                <p className="dashboard-subtitle">
                    Organize seus projetos e acompanhe o progresso de suas tarefas
                </p>
            </div>

            <div className="dashboard-header-actions">
                <div className="search-bar-container">
                    <IconSearch className="search-bar-icon" size={20} stroke={1.5}/>
                    <input
                        type="search"
                        placeholder="Buscar quadros, colunas, cartões..."
                        className="search-bar-input"
                        value={searchQuery}
                        onChange={onSearchChange}
                    />
                </div>

                <button
                    onClick={onAddBoard}
                    className="dashboard-add-btn-small"
                    aria-label="Criar novo quadro"
                >
                    <IconPlus stroke={2} /> <span>Novo quadro</span>
                </button>

                <SettingsMenu />
            </div>
        </div>
    );
}
