import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addBoard } from '../../features/boardsSlice.js';
import { v4 as uuid } from 'uuid';

import DashboardHeader from './components/DashboardHeader';
import EmptyState from './components/EmptyState';
import BoardsGrid from './components/BoardsGrid';
import './Dashboard.css';

import Modal from '../../components/Modal.jsx';

export default function Dashboard() {
    const dispatch = useDispatch();
    // Agora, o componente apenas lê os quadros diretamente do Redux.
    const boards = useSelector(state => state.boards.boards);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setNewBoardTitle('');
        setNewBoardDescription('');
    }

    const handleModalSubmit = (e) => {
        e.preventDefault();
        if (newBoardTitle && newBoardTitle.trim()) {
            dispatch(
                addBoard({
                    id: uuid(),
                    title: newBoardTitle.trim(),
                    description: newBoardDescription.trim(),
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
                <h2 className="modal-title">Criar novo quadro</h2>

                <div className="modal-divider"></div>

                <form onSubmit={handleModalSubmit}>
                    <label htmlFor="boardTitle">Título</label>
                    <input
                        type="text"
                        id="boardTitle"
                        value={newBoardTitle}
                        placeholder="Trabalho do final do semestre"
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        required
                        autoFocus
                    />

                    <label htmlFor="boardDescription">Descrição</label>
                    <input
                        type="text"
                        id="boardDescription"
                        value={newBoardDescription}
                        placeholder="Planejamento das tarefas de Front-End"
                        onChange={(e) => setNewBoardDescription(e.target.value)}
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
