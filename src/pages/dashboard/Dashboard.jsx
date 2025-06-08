import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBoards, addBoard } from '../../features/boardsSlice.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.jsx';
import { v4 as uuid } from 'uuid';

import DashboardHeader from './components/DashboardHeader';
import EmptyState from './components/EmptyState';
import BoardsGrid from './components/BoardsGrid';
import './Dashboard.css';

import Modal from '../../components/Modal.jsx';

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setNewBoardTitle(''); // Limpa o título previamente definido
    }

    const handleModalSubmit = (e) => {
        e.preventDefault();
        if (newBoardTitle && newBoardTitle.trim()) {
            dispatch(
                addBoard({
                    id: uuid(),
                    title: newBoardTitle.trim(),
                    columns: []
                })
            );
            closeModal();
        }
        else {
            alert("O nome do quadro não pode estar vazio!");
        }
    }


    const handleAddBoard = () => {
        openModal();
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

            <Modal isOpen={isModalOpen} onClose={closeModal} >
                <h2>Criar novo quadro</h2>
                <form onSubmit={handleModalSubmit}>
                    <label htmlFor="boardTitle">Nome do quadro:</label>
                    <input
                        type="text"
                        id="boardTitle"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        required
                        autoFocus
                    />
                    <div className="modal-actions">
                        <button type="button" className="btn-danger" onClick={closeModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Criar quadro</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
