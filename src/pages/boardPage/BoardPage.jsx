import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import './BoardPage.css';
import {
    addColumn, deleteColumn, moveCard, updateColumn, deleteCard, moveColumn,
    toggleMultiSelectMode, archiveSelectedCards, deleteSelectedCards, clearCardSelection
} from '../../features/boardsSlice';
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
    IconColumns,
    IconZoomQuestion,
    IconLayoutList,
    IconX,
    IconTrash, IconCopyCheck
} from "@tabler/icons-react";
import SettingsMenu from "../../components/SettingsMenu.jsx";
import Modal from '../../components/Modal';
import { makeSelectBoard } from "../../features/selectors.js";

export default function BoardPage() {
    const { id: boardId } = useParams();
    const dispatch = useDispatch();

    const selectBoard = useMemo(makeSelectBoard, []);
    const board = useSelector(state => selectBoard(state, boardId));
    const isMultiSelectEnabled = useSelector(state => state.boards.isMultiSelectEnabled);
    const selectedCardIds = useSelector(state => state.boards.selectedCardIds);

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

    const [isArchiveMultiModalOpen, setIsArchiveMultiModalOpen] = useState(false);
    const [isDeleteMultiModalOpen, setIsDeleteMultiModalOpen] = useState(false);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    function handleDragStart(event) {
        if (isMultiSelectEnabled) return; // Previne drag-and-drop no modo de seleção
        const { active } = event;
        setActiveItem(active.data.current);
    }

    function onDragCancel() {
        setActiveItem(null);
    }

    function handleDragEnd(event) {
        if (isMultiSelectEnabled) return; // Previne drag-and-drop no modo de seleção
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

    const handleArchiveSelected = () => setIsArchiveMultiModalOpen(true);
    const handleDeleteSelected = () => setIsDeleteMultiModalOpen(true);

    const handleConfirmArchiveSelected = () => {
        dispatch(archiveSelectedCards());
        setIsArchiveMultiModalOpen(false);
    };

    const handleConfirmDeleteSelected = () => {
        dispatch(deleteSelectedCards());
        setIsDeleteMultiModalOpen(false);
    };

    const handleClearAndExitSelection = () => {
        dispatch(clearCardSelection());
        dispatch(toggleMultiSelectMode());
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
        <div className={`board-page ${isMultiSelectEnabled ? 'multi-select-active' : ''}`}>
            <div className="board-header">
                <Link to="/" className="btn-secondary"><IconArrowLeft stroke={2} width={18} height={18} /> Página inicial</Link>
                <h2>{board.title}</h2>
                <div className="board-actions">
                    <button onClick={() => {
                        setShowArchived(!showArchived);
                        if (isMultiSelectEnabled) { dispatch(toggleMultiSelectMode()); } /* O modo de seleção é desativado quando muda a visualização de arquivados para não arquivados e vice-versa */
                    }} className="btn-info" title={showArchived ? "Ocultar arquivados" : "Mostrar arquivados"}>
                        {showArchived ? <IconArchiveOff/> : <IconArchive/>} {showArchived ? "Não arquivados" : "Arquivados"}
                    </button>

                    {!showArchived && (
                        <button
                            onClick={handleOpenAddColumnModal}
                            className="dashboard-add-btn-small"
                            aria-label="Criar nova coluna"
                        >
                            <IconPlus stroke={2} /> <span>Nova coluna</span>
                        </button>)}

                    {!showArchived && (<Link to={`/board/${boardId}/calendar`} className="btn-icon" title="Visão de Calendário"><IconCalendar size={24}/></Link>)}

                    <button onClick={() => dispatch(toggleMultiSelectMode())} className={`btn-icon ${isMultiSelectEnabled ? 'active' : ''}`} title="Selecionar múltiplos cartões">
                        <IconCopyCheck size={24}/>
                    </button>
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
                        <SortableContext items={board.columns.map(c => c.id)} strategy={horizontalListSortingStrategy} disabled={isMultiSelectEnabled}>
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
                                        isMultiSelectEnabled={isMultiSelectEnabled}
                                        selectedCardIds={selectedCardIds}
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

            {isMultiSelectEnabled && selectedCardIds.length > 0 && (
                <div className="multi-select-action-bar">
                    <div className="selection-count">
                        <span>{selectedCardIds.length}</span> {selectedCardIds.length === 1 ? 'cartão selecionado' : 'cartões selecionados'}
                    </div>
                    <div className="selection-actions">
                        <button onClick={handleArchiveSelected} className="btn-icon" title={`${showArchived ? 'Desarquivar' : 'Arquivar'} ${selectedCardIds.length} ${selectedCardIds.length === 1 ? 'cartão' : 'cartões'}.`}>
                            <IconArchive size={22} />
                        </button>
                        <button onClick={handleDeleteSelected} className="btn-icon btn-delete" title={`Deletar ${selectedCardIds.length} ${selectedCardIds.length === 1 ? 'cartão' : 'cartões'}.`}>
                            <IconTrash size={22} />
                        </button>
                    </div>
                    <button onClick={handleClearAndExitSelection} className="btn-icon close-selection-mode" title="Sair do modo de seleção">
                        <IconX size={24} />
                    </button>
                </div>
            )}

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
                        <button type="button" className="btn-danger" onClick={handleConfirmDeleteCard}>Deletar cartão</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isArchiveMultiModalOpen} onClose={() => setIsArchiveMultiModalOpen(false)}>
                <h2 className="modal-title">{showArchived ? "Desarquivar" : "Arquivar"} {selectedCardIds.length} {selectedCardIds.length === 1 ? "cartão" : "cartões"}?</h2>
                <div className="modal-divider"></div>
                <div className="delete-modal-form">
                    <div className="delete-modal-icon">
                        {showArchived ?
                            <IconArchiveOff stroke={2} size={64} /> :
                            <IconArchive stroke={2} size={64} />}
                    </div>
                    <p className="delete-modal-text">
                        {showArchived ?
                            "Os cartões selecionados serão restaurados às colunas de visualização padrão. Você poderá voltar a fazer operações como editar com eles novamente." :
                            "Os cartões selecionados serão movidos para o arquivo. Você poderá visualizá-los e restaurá-los depois."}
                    </p>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary cancel-btn" onClick={() => setIsArchiveMultiModalOpen(false)}>Cancelar</button>
                        <button type="button" className="btn-primary" onClick={handleConfirmArchiveSelected}>{showArchived ? "Desarquivar" : "Arquivar"}</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDeleteMultiModalOpen} onClose={() => setIsDeleteMultiModalOpen(false)}>
                <h2 className="modal-title">Deletar {selectedCardIds.length} {selectedCardIds.length === 1 ? "cartão" : "cartões"}?</h2>
                <div className="modal-divider"></div>
                <div className="delete-modal-form">
                    <div className="delete-modal-icon"><IconAlertCircle stroke={2} size={64} /></div>
                    <p className="delete-modal-text">Essa ação é irreversível! Os cartões selecionados serão excluídos permanentemente.</p>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={() => setIsDeleteMultiModalOpen(false)}>Cancelar</button>
                        <button type="button" className="btn-danger" onClick={handleConfirmDeleteSelected}>Deletar permanentemente</button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}