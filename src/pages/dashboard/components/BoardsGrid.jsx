import React from 'react';
import BoardCard from './BoardCard';

export default function BoardsGrid({ boards }) {
    return (
        <div className="dashboard-boards-grid">
            {boards.map(board => (
                <BoardCard key={board.id} board={board} />
            ))}
        </div>
    );
}
