import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import './BoardPage.css';
import { addColumn, deleteColumn, moveCard } from '../../features/boardsSlice';
import DroppableColumn from './components/DroppableColumn';
import CardModal from './components/CardModal';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {IconArrowLeft, IconPlus, IconArchive, IconArchiveOff, IconAlertTriangle} from "@tabler/icons-react";
import SettingsMenu from "../../components/SettingsMenu.jsx";

export default function BoardPage() {
    const { id: boardId } = useParams();
    const dispatch = useDispatch();

    const board = useSelector(state => {
        const boardData = state.boards.boards.entities[boardId];
        if (!boardData) return null;

        const columns = boardData.columns.map(columnId => {
            const columnData = state.boards.columns.entities[columnId];
            if (!columnData) return null;

            const cards = columnData.cards.map(cardId => state.boards.cards.entities[cardId]).filter(Boolean);
            return { ...columnData, cards };
        }).filter(Boolean);

        return { ...boardData, columns };
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [activeColumnId, setActiveColumnId] = useState(null);

    const [showArchived, setShowArchived] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    const handleOpenAddCardModal = (columnId) => {
        setEditingCard(null);
        setActiveColumnId(columnId);
        setIsModalOpen(true);
    };

    const handleOpenEditCardModal = (card, columnId) => {
        setEditingCard(card);
        setActiveColumnId(columnId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCard(null);
        setActiveColumnId(null);
    };

    const handleAddColumn = () => {
        const title = prompt('Digite o título da nova coluna:');
        if (title && title.trim()) {
            const newColumn = { id: uuid(), title: title.trim(), cards: [] };
            dispatch(addColumn({ boardId, newColumn }));
        }
    };

    const handleRemoveColumn = (columnId) => {
        const column = board.columns.find(c => c.id === columnId);
        if (!column) return;

        const cardCount = column.cards?.length || 0;
        const message = cardCount > 0
            ? `Tem certeza que deseja remover a coluna "${column.title}"? Isso também removerá ${cardCount} cartão(s).`
            : `Tem certeza que deseja remover a coluna "${column.title}"?`;

        if (window.confirm(message)) {
            dispatch(deleteColumn({ boardId, columnId }));
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const sourceCard = active.data.current.card;
        const sourceColumnId = active.data.current.columnId;

        const destColumnId = over.data.current?.type === 'column'
            ? over.id
            : over.data.current?.columnId;

        if (!destColumnId) return;

        const sourceColumn = board.columns.find(c => c.id === sourceColumnId);
        const destColumn = board.columns.find(c => c.id === destColumnId);

        if (!sourceColumn || !destColumn) return;

        const sourceIndex = sourceColumn.cards.findIndex(c => c.id === sourceCard.id);

        let destIndex;
        if (over.data.current?.type === 'card') {
            destIndex = destColumn.cards.findIndex(c => c.id === over.id);
        } else {
            destIndex = destColumn.cards.length;
        }

        dispatch(moveCard({
            boardId, // boardId não é mais necessário no reducer, mas mantemos por consistência se necessário
            sourceColumnId,
            destColumnId,
            sourceIndex,
            destIndex,
            cardId: active.id // Passamos o cardId diretamente
        }));
    };

    if (!board) {
        return (
            <div className="board-page">
                <Link to="/" className="btn-secondary">
                    <IconArrowLeft stroke={2} width={18} height={18} /> Página inicial
                </Link>
                <div className="error-message">
                    <h2>Quadro não encontrado</h2>
                    <p>O quadro que você está procurando não existe ou foi removido.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="board-page">
            <div className="board-header">
                <Link to="/" className="btn-secondary">
                    <IconArrowLeft stroke={2} width={18} height={18} /> Página inicial
                </Link>
                <h2>{board.title}</h2>
                <div className="board-actions">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className="btn-info"
                        title={showArchived ? "Ocultar arquivados" : "Mostrar arquivados"}
                    >
                        {showArchived ? <IconArchiveOff/> : <IconArchive/>}
                    </button>

                    {!showArchived && (
                        <button onClick={handleAddColumn} className="dashboard-add-btn-small" title="Adicionar nova coluna">
                            <IconPlus />
                        </button>
                    )}

                    <SettingsMenu/>
                </div>
            </div>

            {showArchived && (
                <div className="archive-view-header">
                    <IconAlertTriangle size={40} className="archive-warning-icon"/>
                    <div className="archive-view-content">
                        <h3>Modo de visualização: Arquivados</h3>
                        <p>Apenas cartões arquivados são exibidos. Para voltar à visualização normal, clique no ícone de ocultar.</p>
                    </div>
                </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="columns-container">
                    {board.columns?.length === 0 ? (
                        <div className="empty-board">
                            <p>Este quadro ainda não tem colunas.</p>
                            <button onClick={handleAddColumn} className="btn-primary">
                                Criar primeira coluna
                            </button>
                        </div>
                    ) : (
                        board.columns.map(column => {
                            const filteredCards = column.cards
                                ? column.cards.filter(card => showArchived ? card.isArchived : !card.isArchived)
                                : [];

                            return (
                                <DroppableColumn
                                    key={column.id}
                                    column={column}
                                    cards={filteredCards}
                                    onAddCard={handleOpenAddCardModal}
                                    onEditCard={handleOpenEditCardModal}
                                    onRemoveColumn={handleRemoveColumn}
                                    isArchiveView={showArchived}
                                />
                            );
                        })
                    )}
                </div>
            </DndContext>

            <CardModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                columnId={activeColumnId}
                card={editingCard}
            />
        </div>
    );
}