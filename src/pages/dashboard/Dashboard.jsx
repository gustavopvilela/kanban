import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBoards, addBoard } from '../../features/boardsSlice.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.jsx';
import { v4 as uuid } from 'uuid';

import DashboardHeader from './components/DashboardHeader';
import EmptyState from './components/EmptyState';
import BoardsGrid from './components/BoardsGrid';
import './Dashboard.css';

export default function Dashboard() {
    const dispatch = useDispatch();
    const boards = useSelector(state => state.boards.boards);
    const [storedBoards, setStoredBoards] = useLocalStorage('kanban-boards', []);

    // Carrega do localStorage ao montar
    useEffect(() => {
        if (storedBoards.length > 0 && boards.length === 0) {
            dispatch(setBoards(storedBoards));
        }
    }, [dispatch, storedBoards, boards.length]);

    // Salva no localStorage sempre que boards mudar
    useEffect(() => {
        if (boards.length > 0) {
            setStoredBoards(boards);
        }
    }, [boards, setStoredBoards]);

    const handleAddBoard = () => {
        const title = prompt('Nome do quadro:');
        if (title && title.trim()) {
            dispatch(
                addBoard({
                    id: uuid(),
                    title: title.trim(),
                    columns: []
                })
            );
        }
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader onAddBoard={handleAddBoard} />

            <div className="dashboard-content">
                {boards.length === 0 ? (
                    <EmptyState onCreate={handleAddBoard} />
                ) : (
                    <BoardsGrid boards={boards} />
                )}
            </div>
        </div>
    );
}
