import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addBoard } from '../../features/boardsSlice.js';
import { v4 as uuid } from 'uuid';

import DashboardHeader from './components/DashboardHeader';
import EmptyState from './components/EmptyState';
import BoardsGrid from './components/BoardsGrid';
import SearchResults from './components/SearchResults';
import './Dashboard.css';

import Modal from '../../components/Modal.jsx';
import {selectAllBoards, selectSearchData} from "../../features/selectors.js";

// Função auxiliar para destacar o texto encontrado
// NOVA função highlightMatch corrigida
const highlightMatch = (text, query) => {
    if (!text || !query) return text;

    // Normaliza ambos os textos para encontrar a posição do match
    const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const startIndex = normalizedText.indexOf(normalizedQuery);

    // Se não encontrar, retorna o texto original
    if (startIndex === -1) {
        return text;
    }

    const endIndex = startIndex + query.length;

    // Recorta o texto original com base nas posições encontradas
    const preMatch = text.substring(0, startIndex);
    const match = text.substring(startIndex, endIndex);
    const postMatch = text.substring(endIndex);

    // Retorna a string com a parte correspondente dentro da tag <strong>
    return `${preMatch}<strong>${match}</strong>${postMatch}`;
};

const normalizeText = (text) => {
    if (!text) return '';
    return text
        .normalize('NFD') // Separa os caracteres de seus acentos
        .replace(/[\u0300-\u036f]/g, '') // Remove os acentos (diacríticos)
        .toLowerCase(); // Converte para minúsculas
};

export default function Dashboard() {
    const dispatch = useDispatch();

    const { boards, columns, cards } = useSelector(selectSearchData);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const normalizedQuery = normalizeText(searchQuery);
        const results = [];

        // 1. Buscar nos Quadros (Boards)
        for (const board of Object.values(boards)) {
            // Comparação agora é normalizada
            if (normalizeText(board.title).includes(normalizedQuery)) {
                results.push({
                    type: 'board',
                    item: board,
                    board: board,
                    highlightedTitle: highlightMatch(board.title, searchQuery)
                });
            }
        }

        // 2. Buscar nas Colunas
        for (const column of Object.values(columns)) {
            // Comparação agora é normalizada
            if (normalizeText(column.title).includes(normalizedQuery)) {
                const parentBoard = Object.values(boards).find(b => b.columns.includes(column.id));
                if (parentBoard) {
                    results.push({
                        type: 'column',
                        item: column,
                        board: parentBoard,
                        highlightedTitle: highlightMatch(column.title, searchQuery)
                    });
                }
            }
        }

        // 3. Buscar nos Cartões
        for (const card of Object.values(cards)) {
            // Comparações agora são normalizadas
            const titleMatch = normalizeText(card.title).includes(normalizedQuery);
            const descriptionMatch = card.description && normalizeText(card.description).includes(normalizedQuery);

            if (titleMatch || descriptionMatch) {
                const parentColumn = Object.values(columns).find(c => c.cards.includes(card.id));
                if (parentColumn) {
                    const parentBoard = Object.values(boards).find(b => b.columns.includes(parentColumn.id));
                    if (parentBoard) {
                        results.push({
                            type: 'card',
                            item: card,
                            column: parentColumn,
                            board: parentBoard,
                            highlightedTitle: highlightMatch(card.title, searchQuery),
                            highlightedDescription: descriptionMatch ? highlightMatch(card.description, searchQuery) : null
                        });
                    }
                }
            }
        }

        setSearchResults(results);

    }, [searchQuery, boards, columns, cards]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const allBoards = useSelector(selectAllBoards);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setNewBoardTitle('');
        setNewBoardDescription('');
    };

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
        } else {
            alert("O nome do quadro não pode estar vazio!");
        }
    };

    const handleAddBoard = () => {
        openModal();
    };

    const renderContent = () => {
        if (searchQuery.trim()) {
            return <SearchResults results={searchResults} />;
        }
        if (allBoards.length === 0) {
            return <EmptyState onCreate={handleAddBoard} />;
        }
        return <BoardsGrid boards={allBoards} />;
    };

    return (
        <div className="dashboard-container">
            <DashboardHeader
                onAddBoard={handleAddBoard}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />

            <div className="dashboard-content">
                {renderContent()}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
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