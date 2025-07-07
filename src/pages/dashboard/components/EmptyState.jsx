import React from 'react';
import {IconClipboardOff} from "@tabler/icons-react";

export default function EmptyState({ onCreate }) {
    return (
        <div className="dashboard-empty-state">
            <div className="empty-state-icon"><IconClipboardOff size={80} stroke={1.5}/></div>
            <h2 className="empty-state-title">Nenhum quadro encontrado</h2>
            <p className="empty-state-description">
                Comece criando seu primeiro quadro Kanban para organizar suas tarefas e projetos.
            </p>
            <button onClick={onCreate} className="empty-state-btn">
                Criar primeiro quadro
            </button>
        </div>
    );
}
