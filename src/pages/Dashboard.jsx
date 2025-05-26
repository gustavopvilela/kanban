import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setBoards, addBoard } from '../features/boardsSlice';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuid } from 'uuid';

export default function Dashboard() {
    const dispatch = useDispatch();
    const boards = useSelector(state => state.boards.boards);
    const [storedBoards, setStoredBoards] = useLocalStorage('kanban-boards', []);

    // Initialize boards from localStorage on component mount
    useEffect(() => {
        if (storedBoards.length > 0 && boards.length === 0) {
            dispatch(setBoards(storedBoards));
        }
    }, [dispatch, storedBoards, boards.length]);

    // Save boards to localStorage whenever they change
    useEffect(() => {
        if (boards.length > 0) {
            setStoredBoards(boards);
        }
    }, [boards, setStoredBoards]);

    const handleAddBoard = () => {
        const title = prompt('Nome do quadro:');
        if (title && title.trim()) {
            dispatch(addBoard({
                id: uuid(),
                title: title.trim(),
                columns: []
            }));
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header section with welcome message and action button */}
            <div className="dashboard-header">
                <div className="dashboard-title-section">
                    <h1 className="dashboard-title">Meus Quadros Kanban</h1>
                    <p className="dashboard-subtitle">
                        Organize seus projetos e acompanhe o progresso de suas tarefas
                    </p>
                </div>
                <button
                    onClick={handleAddBoard}
                    className="dashboard-add-btn"
                    aria-label="Criar novo quadro"
                >
                    <span className="add-icon">+</span>
                    Novo Quadro
                </button>
            </div>

            {/* Main content area */}
            <div className="dashboard-content">
                {boards.length === 0 ? (
                    // Empty state when no boards exist
                    <div className="dashboard-empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h2 className="empty-state-title">Nenhum quadro encontrado</h2>
                        <p className="empty-state-description">
                            Comece criando seu primeiro quadro Kanban para organizar suas tarefas e projetos.
                        </p>
                        <button
                            onClick={handleAddBoard}
                            className="empty-state-btn"
                        >
                            Criar Primeiro Quadro
                        </button>
                    </div>
                ) : (
                    // Grid of board cards when boards exist
                    <div className="dashboard-boards-grid">
                        {boards.map(board => (
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
                                        <span className="board-columns-count">
                                            {board.columns?.length || 0} colunas
                                        </span>
                                        <span className="board-cards-count">
                                            {board.columns?.reduce((total, col) =>
                                                total + (col.cards?.length || 0), 0) || 0} cards
                                        </span>
                                    </div>
                                </div>
                                <div className="board-card-arrow">→</div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}