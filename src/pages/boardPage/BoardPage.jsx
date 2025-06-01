import React, { useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateBoard } from '../../features/boardsSlice';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { v4 as uuid } from 'uuid';
import './BoardPage.css';

// DnD Kit
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';

import DroppableColumn from './components/DroppableColumn';
import {
    IconArrowLeft,
    IconPlus
} from "@tabler/icons-react";

export default function BoardPage() {
    const { id } = useParams();
    const dispatch = useDispatch();

    // ----- HOOKS DO REDUX -----
    const board = useSelector(state =>
        state.boards.boards.find(b => b.id === id)
    );
    const allBoards = useSelector(state => state.boards.boards);

    // ----- HOOK CUSTOMIZADO PARA LOCALSTORAGE -----
    const [, setStored] = useLocalStorage('kanban_boards', allBoards);

    // ----- SENSORES DO DND-KIT -----
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    // ----- UPDATE NO REDUX -----
    const updateBoardData = useCallback((updatedBoard) => {
        if (!updatedBoard || !updatedBoard.id) {
            console.error('Tentativa de atualizar board inválido:', updatedBoard);
            return;
        }
        dispatch(updateBoard(updatedBoard));
    }, [dispatch]);

    // ----- SINCRONIZAÇÃO COM LOCALSTORAGE -----
    const syncToStorage = useCallback(() => {
        setStored(allBoards);
    }, [allBoards, setStored]);

    // ----- ADD / REMOVE COLUMNS & CARDS -----

    const handleAddColumn = useCallback(() => {
        if (!board) return;
        const title = prompt('Digite o título da nova coluna:');
        if (!title || title.trim() === '') return;
        const newColumn = {
            id: uuid(),
            title: title.trim(),
            cards: []
        };
        const updatedBoard = {
            ...board,
            columns: [...(board.columns || []), newColumn]
        };
        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    const handleAddCard = useCallback((columnId) => {
        if (!board) return;
        const text = prompt('Digite o texto do novo card:');
        if (!text || text.trim() === '') return;

        const currentColumns = board.columns || [];
        const targetColumn = currentColumns.find(col => col.id === columnId);
        if (!targetColumn) {
            console.error('Coluna não encontrada:', columnId);
            return;
        }

        const newCard = {
            id: uuid(),
            text: text.trim()
        };

        const updatedColumns = currentColumns.map(col =>
            col.id === columnId
                ? { ...col, cards: [...(col.cards || []), newCard] }
                : col
        );

        const updatedBoard = { ...board, columns: updatedColumns };
        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    const handleRemoveCard = useCallback((columnId, cardId) => {
        if (!board) return;
        const confirmed = window.confirm('Tem certeza que deseja remover este card?');
        if (!confirmed) return;

        const currentColumns = board.columns || [];
        const updatedColumns = currentColumns.map(col =>
            col.id === columnId
                ? { ...col, cards: (col.cards || []).filter(card => card.id !== cardId) }
                : col
        );

        const updatedBoard = { ...board, columns: updatedColumns };
        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    const handleRemoveColumn = useCallback((columnId) => {
        if (!board) return;
        const columnObj = (board.columns || []).find(col => col.id === columnId);
        if (!columnObj) return;

        const cardCount = (columnObj.cards || []).length;
        const message = cardCount > 0
            ? `Tem certeza que deseja remover a coluna "${columnObj.title}"? Isso também removerá ${cardCount} card(s).`
            : `Tem certeza que deseja remover a coluna "${columnObj.title}"?`;

        const confirmed = window.confirm(message);
        if (!confirmed) return;

        const updatedColumns = (board.columns || []).filter(col => col.id !== columnId);
        const updatedBoard = { ...board, columns: updatedColumns };
        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    // ----- DRAG-AND-DROP (DnD) -----

    const handleDragEnd = useCallback((event) => {
        if (!board) return;
        const { active, over } = event;
        if (!over) return;
        if (active.id === over.id) return;

        const activeData = active.data.current;
        const overData = over.data.current;
        if (!activeData || activeData.type !== 'card') {
            console.error('Dados de drag inválidos:', activeData);
            return;
        }

        const draggedCard = activeData.card;
        const sourceColumnId = activeData.columnId;

        // Determinar destino e índice
        let targetColumnId;
        let targetIndex;

        if (overData && overData.type === 'column') {
            targetColumnId = overData.column.id;
            targetIndex = (overData.column.cards || []).length;
        } else if (overData && overData.type === 'card') {
            targetColumnId = overData.columnId;
            const targetColumn = (board.columns || []).find(col => col.id === targetColumnId);
            targetIndex = targetColumn
                ? (targetColumn.cards || []).findIndex(card => card.id === over.id)
                : 0;
        } else {
            targetColumnId = over.id;
            const targetColumn = (board.columns || []).find(col => col.id === targetColumnId);
            if (targetColumn) {
                targetIndex = (targetColumn.cards || []).length;
            } else {
                console.error('Não foi possível determinar a coluna de destino');
                return;
            }
        }

        const currentColumns = board.columns || [];
        const sourceColumn = currentColumns.find(col => col.id === sourceColumnId);
        const targetColumn = currentColumns.find(col => col.id === targetColumnId);
        if (!sourceColumn || !targetColumn) {
            console.error('Coluna não encontrada:', { sourceColumnId, targetColumnId });
            return;
        }

        // Se for mesma coluna, apenas reordena
        if (sourceColumnId === targetColumnId) {
            const columnCards = [...(sourceColumn.cards || [])];
            const sourceIndex = columnCards.findIndex(card => card.id === draggedCard.id);
            if (sourceIndex === -1) {
                console.error('Card não encontrado na coluna de origem');
                return;
            }
            const [removed] = columnCards.splice(sourceIndex, 1);
            columnCards.splice(targetIndex, 0, removed);

            const updatedColumns = currentColumns.map(col =>
                col.id === sourceColumnId
                    ? { ...col, cards: columnCards }
                    : col
            );
            updateBoardData({ ...board, columns: updatedColumns });
        } else {
            // Move de uma coluna para outra
            const sourceCards = [...(sourceColumn.cards || [])];
            const targetCards = [...(targetColumn.cards || [])];

            const sourceIndex = sourceCards.findIndex(card => card.id === draggedCard.id);
            if (sourceIndex === -1) {
                console.error('Card não encontrado na coluna de origem');
                return;
            }
            const [removed] = sourceCards.splice(sourceIndex, 1);
            targetCards.splice(targetIndex, 0, removed);

            const updatedColumns = currentColumns.map(col => {
                if (col.id === sourceColumnId) {
                    return { ...col, cards: sourceCards };
                }
                if (col.id === targetColumnId) {
                    return { ...col, cards: targetCards };
                }
                return col;
            });

            updateBoardData({ ...board, columns: updatedColumns });
        }
    }, [board, updateBoardData]);

    // ----- useEffect para sincronizar no localStorage sempre que allBoards mudar -----
    useEffect(() => {
        syncToStorage();
    }, [allBoards, syncToStorage]);

    // ----- Se o board não existir (URL inválida) -----
    if (!board) {
        return (
            <div className="board-page">
                <Link to="/" className="btn-secondary">
                    <IconArrowLeft stroke={2} width={18} height={18} /> Página inicial
                </Link>
                <div className="error-message">
                    <h2>Board não encontrado</h2>
                    <p>O board que você está procurando não existe ou foi removido.</p>
                </div>
            </div>
        );
    }

    // ----- Dados para renderizar -----
    const boardColumns = board.columns || [];
    const boardTitle = board.title || 'Board sem título';

    return (
        <div className="board-page">
            {/* Cabeçalho */}
            <div className="board-header">
                <Link to="/" className="btn-secondary">
                    <IconArrowLeft stroke={2} width={18} height={18} /> Página inicial
                </Link>
                <h2>{boardTitle}</h2>
                <button
                    onClick={handleAddColumn}
                    className="btn-primary"
                    title="Adicionar nova coluna"
                >
                    <IconPlus /> Nova coluna
                </button>
            </div>

            {/* Contexto do DnD Kit */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="columns-container">
                    {boardColumns.length === 0 ? (
                        <div className="empty-board">
                            <p>Este board ainda não tem colunas.</p>
                            <button onClick={handleAddColumn} className="btn-primary">
                                Criar primeira coluna
                            </button>
                        </div>
                    ) : (
                        boardColumns.map(column => (
                            <DroppableColumn
                                key={column.id}
                                column={column}
                                onAddCard={handleAddCard}
                                onRemoveColumn={handleRemoveColumn}
                                onRemoveCard={handleRemoveCard}
                            />
                        ))
                    )}
                </div>
            </DndContext>
        </div>
    );
}
