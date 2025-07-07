import React, {useMemo, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import './BoardPage.css';
import { addColumn, deleteColumn, moveCard, updateColumn, deleteCard, moveColumn } from '../../features/boardsSlice';
import DroppableColumn from './components/DroppableColumn';
import DraggableCard from './components/DraggableCard.jsx';
import CardModal from './components/CardModal.jsx';
import ColumnModal from './components/ColumnModal.jsx';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import {
    IconArrowLeft,
    IconPlus,
    IconArchive,
    IconArchiveOff,
    IconAlertTriangle,
    IconCalendar,
    IconAlertCircle,
    IconColumns, IconZoomQuestion
} from "@tabler/icons-react";
import SettingsMenu from "../../components/SettingsMenu.jsx";
import Modal from '../../components/Modal';
import {makeSelectBoard} from "../../features/selectors.js";

export default function BoardPage() {
    const { id: boardId } = useParams();
    const dispatch = useDispatch();

    const selectBoard = useMemo(makeSelectBoard, []);
    const board = useSelector(state => selectBoard(state, boardId));

    const [activeItem, setActiveItem] = useState(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [activeColumnId, setActiveColumnId] = useState(null);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState(null);
    const [isDeleteColumnModalOpen, setIsDeleteColumnModalOpen] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState(null);
    const [isDeleteCardModalOpen, setIsDeleteCardModalOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [showArchived, setShowArchived] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    function handleDragStart(event) {
        const { active } = event;
        setActiveItem(active.data.current);
    }

    function onDragCancel() {
        setActiveItem(null);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;
        
        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAColumn = active.data.current?.type === 'column';
        const isActiveACard = active.data.current?.type === 'card';

        if (isActiveAColumn) {
            const activeColumnIndex = board.columns.findIndex(c => c.id === activeId);
            const overColumnIndex = board.columns.findIndex(c => c.id === overId);
            dispatch(moveColumn({
                boardId,
                sourceIndex: activeColumnIndex,
                destinationIndex: overColumnIndex,
            }));
            return;
        }

        if (isActiveACard) {
            const sourceCard = active.data.current.card;
            const sourceColumn = board.columns.find(col => col.cards.some(c => c.id === sourceCard.id));
            if (!sourceColumn) return;
            const sourceColumnId = sourceColumn.id;
            const sourceIndex = sourceColumn.cards.findIndex(c => c.id === sourceCard.id);

            const destColumn = over.data.current?.type === 'column'
                ? board.columns.find(c => c.id === overId)
                : board.columns.find(col => col.cards.some(c => c.id === overId));
            if (!destColumn) return;
            const destColumnId = destColumn.id;
            
            let destIndex;
            if (over.data.current?.type === 'card') {
                destIndex = destColumn.cards.findIndex(c => c.id === overId);
            } else {
                destIndex = destColumn.cards.length;
            }

            dispatch(moveCard({
                sourceColumnId,
                destColumnId,
                sourceIndex,
                destIndex,
                cardId: active.id
            }));
        }
    }

    const handleOpenAddCardModal = (columnId) => {
        setEditingCard(null);
        setActiveColumnId(columnId);
        setIsCardModalOpen(true);
    };

    const handleOpenEditCardModal = (card, columnId) => {
        setEditingCard(card);
        setActiveColumnId(columnId);
        setIsCardModalOpen(true);
    };

    const handleCloseCardModal = () => {
        setIsCardModalOpen(false);
        setEditingCard(null);
        setActiveColumnId(null);
    };

    const handleOpenAddColumnModal = () => {
        setEditingColumn(null);
        setIsColumnModalOpen(true);
    };

    const handleOpenEditColumnModal = (column) => {
        setEditingColumn(column);
        setIsColumnModalOpen(true);
    };

    const handleCloseColumnModal = () => {
        setIsColumnModalOpen(false);
        setEditingColumn(null);
    };

    const handleSaveColumn = (title) => {
        if (editingColumn) {
            dispatch(updateColumn({ columnId: editingColumn.id, title }));
        } else {
            const newColumn = { id: uuid(), title, cards: [] };
            dispatch(addColumn({ boardId, newColumn }));
        }
    };
    
    const handleRemoveColumn = (columnId) => {
        const column = board.columns.find(c => c.id === columnId);
        if (column) {
            setColumnToDelete(column);
            setIsDeleteColumnModalOpen(true);
        }
    };

     const handleConfirmDeleteColumn = () => {
        if (columnToDelete) {
            dispatch(deleteColumn({ boardId, columnId: columnToDelete.id }));
            setIsDeleteColumnModalOpen(false);
            setColumnToDelete(null);
        }
    };

    const handleCloseDeleteColumnModal = () => {
        setIsDeleteColumnModalOpen(false);
        setColumnToDelete(null);
    };

    const handleOpenDeleteCardModal = (card) => {
        setCardToDelete(card);
        setIsCardModalOpen(false);
        setIsDeleteCardModalOpen(true);
    };

    const handleConfirmDeleteCard = () => {
        if (cardToDelete) {
            const column = board.columns.find(col => col.cards.some(c => c.id === cardToDelete.id));
            if (column) {
                dispatch(deleteCard({ columnId: column.id, cardId: cardToDelete.id }));
            }
            setIsDeleteCardModalOpen(false);
            setCardToDelete(null);
        }
    };
    const handleCloseDeleteCardModal = () => {
        setIsDeleteCardModalOpen(false);
        setCardToDelete(null);
    };

    if (!board) {
        return ( 
            <div className="board-page">
                <Link to="/" className="btn-secondary"><IconArrowLeft stroke={2} width={18} height={18} /> Página inicial</Link>
                <div className="error-message"><h2>Quadro não encontrado</h2><p>O quadro que você está procurando não existe ou foi removido.</p></div>
            </div>
        );
    }
    
    return (
        <div className="board-page">
            <div className="board-header">
                <Link to="/" className="btn-secondary"><IconArrowLeft stroke={2} width={18} height={18} /> Página inicial</Link>
                <h2>{board.title}</h2>
                <div className="board-actions">
                    {!showArchived && (<Link to={`/board/${boardId}/calendar`} className="btn-icon" title="Visão de Calendário"><IconCalendar size={24}/></Link>)}
                    <button onClick={() => setShowArchived(!showArchived)} className="btn-info" title={showArchived ? "Ocultar arquivados" : "Mostrar arquivados"}>
                        {showArchived ? <IconArchiveOff/> : <IconArchive/>}
                    </button>
                    {!showArchived && (<button onClick={handleOpenAddColumnModal} className="dashboard-add-btn-small" title="Adicionar nova coluna"><IconPlus /></button>)}
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
            
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={onDragCancel}
            >
                <div className="columns-container">
                    {board.columns?.length === 0 && !showArchived ? (
                        <div className="empty-board">
                            <IconZoomQuestion size={52} stroke={1.5}/>
                            <div style={{height: 25}}></div>

                            <p>Este quadro ainda não tem colunas.</p>
                            <button onClick={handleOpenAddColumnModal} className="btn-primary">
                                Criar primeira coluna
                            </button>
                        </div>
                    ) : (
                        <SortableContext items={board.columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                            {board.columns.map(column => {
                                const cardsToShow = showArchived
                                    ? column.cards.filter(card => card.isArchived)
                                    : column.cards.filter(card => !card.isArchived);

                                if (showArchived && cardsToShow.length === 0) {
                                    return null;
                                }

                                return (
                                    <DroppableColumn
                                        key={column.id}
                                        column={column}
                                        cards={cardsToShow}
                                        onAddCard={() => handleOpenAddCardModal(column.id)}
                                        onEditCard={(card) => handleOpenEditCardModal(card, column.id)}
                                        onRemoveColumn={() => handleRemoveColumn(column.id)}
                                        onEditColumn={() => handleOpenEditColumnModal(column)}
                                        isArchiveView={showArchived}
                                    />
                                );
                            })}
                        </SortableContext>
                    )}
                </div>

                <DragOverlay>
                    {activeItem?.type === 'column' && <DroppableColumn column={activeItem.column} cards={[]} isArchiveView={true} />}
                    {activeItem?.type === 'card' && <DraggableCard card={activeItem.card} onEdit={() => {}} />}
                </DragOverlay>
            </DndContext>

            <CardModal isOpen={isCardModalOpen} onClose={handleCloseCardModal} columnId={activeColumnId} card={editingCard} onDeleteCard={handleOpenDeleteCardModal} />
            <ColumnModal isOpen={isColumnModalOpen} onClose={handleCloseColumnModal} onSave={handleSaveColumn} column={editingColumn} />
            <Modal isOpen={isDeleteColumnModalOpen} onClose={handleCloseDeleteColumnModal}>
                <h2 className="modal-title">Deletar coluna <i>"{columnToDelete?.title}"</i>?</h2>
                <div className="modal-divider"></div>
                <div className="delete-modal-form">
                    <div className="delete-modal-icon"><IconAlertCircle stroke={2} size={64} /></div>
                    <p className="delete-modal-text">Essa ação é irreversível e também removerá todos os cartões desta coluna. Deseja prosseguir?</p>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleCloseDeleteColumnModal}>Cancelar</button>
                        <button type="button" className="btn-danger" onClick={handleConfirmDeleteColumn}>Deletar Coluna</button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isDeleteCardModalOpen} onClose={handleCloseDeleteCardModal}>
                <h2 className="modal-title">Deletar cartão <i>"{cardToDelete?.title}"</i>?</h2>
                <div className="modal-divider"></div>
                <div className="delete-modal-form">
                    <div className="delete-modal-icon"><IconAlertCircle stroke={2} size={64} /></div>
                    <p className="delete-modal-text">Essa ação é irreversível. O cartão será excluído permanentemente.</p>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleCloseDeleteCardModal}>Cancelar</button>
                        <button type="button" className="btn-danger" onClick={handleConfirmDeleteCard}>Deletar Cartão</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}