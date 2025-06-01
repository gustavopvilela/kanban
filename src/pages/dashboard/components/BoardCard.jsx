import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';

export default function BoardCard({ board }) {
    const totalColumns = board.columns?.length || 0;
    const columnsText = `${totalColumns} ${totalColumns === 1 ? 'coluna' : 'colunas'}`;

    const totalCards = board.columns?.reduce(
        (sum, col) => sum + (col.cards?.length || 0),
        0
    ) || 0;
    const cardsText = `${totalCards} ${totalCards === 1 ? 'cartão' : 'cartões'}`;

    return (
        <Link
            key={board.id}
            to={`/board/${board.id}`}
            className="dashboard-board-card"
            aria-label={`Abrir quadro ${board.title}`}
        >
            <div className="board-card-content">
                <div className="board-card-icon">📊</div>
                <h3 className="board-card-title">{board.title}</h3>
                <div className="board-card-meta">
                    <span className="board-columns-count">{columnsText}</span>
                    <span className="board-cards-count">{cardsText}</span>
                </div>
            </div>
            <div className="board-card-arrow">
                <IconArrowRight stroke={2} />
            </div>
        </Link>
    );
}
