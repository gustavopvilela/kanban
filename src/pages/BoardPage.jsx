import React, { useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateBoard } from '../features/boardsSlice';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DndWrapper } from '../hooks/useDragAndDrop';
import { v4 as uuid } from 'uuid';
// Importações necessárias para @dnd-kit/core
import {
    useDroppable,
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente para cada card individual que pode ser arrastado
function DraggableCard({ card, columnId, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'card',
            card,
            columnId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card"
            title={card.text}
        >
            <div className="card-content">
                {card.text || 'Card sem texto'}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Evita que o drag seja ativado
                    onRemove();
                }}
                className="card-remove-btn"
                title="Remover card"
            >
                ×
            </button>
        </div>
    );
}

// Componente para cada coluna que pode receber cards
function DroppableColumn({ column, onAddCard, onRemoveColumn, onRemoveCard }) {
    const {
        setNodeRef,
        isOver,
    } = useDroppable({
        id: column.id,
        data: {
            type: 'column',
            column
        }
    });

    const columnCards = column.cards || [];
    const columnTitle = column.title || 'Coluna sem título';

    return (
        <div className="column">
            {/* Cabeçalho da coluna */}
            <div className="column-header">
                <h3 title={columnTitle}>{columnTitle}</h3>
                <div className="column-actions">
                    <button
                        onClick={() => onAddCard(column.id)}
                        className="btn-secondary btn-small"
                        title="Adicionar novo card"
                    >
                        + Card
                    </button>
                    <button
                        onClick={() => onRemoveColumn(column.id)}
                        className="btn-danger btn-small"
                        title="Remover coluna"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Área de drop para os cards */}
            <div
                ref={setNodeRef}
                className={`cards-container ${isOver ? 'drag-over' : ''}`}
            >
                {columnCards.length === 0 ? (
                    <div className="empty-column">
                        <p>Nenhum card ainda</p>
                        {isOver && <p className="drop-hint">Solte o card aqui</p>}
                    </div>
                ) : (
                    <SortableContext
                        items={columnCards.map(card => card.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {columnCards.map((card) => (
                            <DraggableCard
                                key={card.id}
                                card={card}
                                columnId={column.id}
                                onRemove={() => onRemoveCard(column.id, card.id)}
                            />
                        ))}
                    </SortableContext>
                )}
            </div>
        </div>
    );
}

export default function BoardPage() {
    const { id } = useParams();
    const dispatch = useDispatch();

    // TODOS OS HOOKS DEVEM ESTAR NO TOPO, ANTES DE QUALQUER LÓGICA CONDICIONAL

    // Hooks do Redux - sempre executados
    const board = useSelector(state =>
        state.boards.boards.find(b => b.id === id)
    );
    const allBoards = useSelector(state => state.boards.boards);

    // Hook customizado para localStorage - sempre executado
    const [, setStored] = useLocalStorage('kanban_boards', allBoards);

    // Configuração dos sensores para @dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Inicia drag só após 8px de movimento
            },
        })
    );

    // Função auxiliar para atualizar o board no Redux
    const updateBoardData = useCallback((updatedBoard) => {
        if (!updatedBoard || !updatedBoard.id) {
            console.error('Tentativa de atualizar board inválido:', updatedBoard);
            return;
        }

        dispatch(updateBoard(updatedBoard));
    }, [dispatch]);

    // Memoiza a função de sincronização para evitar re-renders desnecessários
    const syncToStorage = useCallback(() => {
        setStored(allBoards);
    }, [allBoards, setStored]);

    // Função para adicionar uma nova coluna
    const handleAddColumn = useCallback(() => {
        if (!board) return;

        const title = prompt('Digite o título da nova coluna:');

        if (!title || title.trim() === '') {
            return;
        }

        const newColumn = {
            id: uuid(),
            title: title.trim(),
            cards: []
        };

        const currentColumns = board.columns || [];

        const updatedBoard = {
            ...board,
            columns: [...currentColumns, newColumn],
        };

        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    // Função para adicionar um novo card em uma coluna específica
    const handleAddCard = useCallback((columnId) => {
        if (!board) return;

        const text = prompt('Digite o texto do novo card:');

        if (!text || text.trim() === '') {
            return;
        }

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
                ? {
                    ...col,
                    cards: [...(col.cards || []), newCard]
                }
                : col
        );

        const updatedBoard = {
            ...board,
            columns: updatedColumns,
        };

        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    // Função para remover um card
    const handleRemoveCard = useCallback((columnId, cardId) => {
        if (!board) return;

        const confirmed = window.confirm('Tem certeza que deseja remover este card?');
        if (!confirmed) return;

        const currentColumns = board.columns || [];

        const updatedColumns = currentColumns.map(col =>
            col.id === columnId
                ? {
                    ...col,
                    cards: (col.cards || []).filter(card => card.id !== cardId)
                }
                : col
        );

        const updatedBoard = {
            ...board,
            columns: updatedColumns,
        };

        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    // Função para remover uma coluna inteira
    const handleRemoveColumn = useCallback((columnId) => {
        if (!board) return;

        const column = (board.columns || []).find(col => col.id === columnId);
        if (!column) return;

        const cardCount = (column.cards || []).length;
        const message = cardCount > 0
            ? `Tem certeza que deseja remover a coluna "${column.title}"? Isso também removerá ${cardCount} card(s).`
            : `Tem certeza que deseja remover a coluna "${column.title}"?`;

        const confirmed = window.confirm(message);
        if (!confirmed) return;

        const updatedColumns = (board.columns || []).filter(col => col.id !== columnId);

        const updatedBoard = {
            ...board,
            columns: updatedColumns,
        };

        updateBoardData(updatedBoard);
    }, [board, updateBoardData]);

    // Lógica de drag-and-drop atualizada para @dnd-kit
    const handleDragEnd = useCallback((event) => {
        if (!board) return;

        const { active, over } = event;

        // Se não houve drop válido, aborta
        if (!over) return;

        // Se dropped no mesmo lugar, não faz nada
        if (active.id === over.id) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        // Validação básica dos dados
        if (!activeData || activeData.type !== 'card') {
            console.error('Dados de drag inválidos:', activeData);
            return;
        }

        const draggedCard = activeData.card;
        const sourceColumnId = activeData.columnId;

        // Determina a coluna de destino
        let targetColumnId;
        let targetIndex;

        if (overData && overData.type === 'column') {
            // Dropped diretamente em uma coluna
            targetColumnId = overData.column.id;
            targetIndex = (overData.column.cards || []).length; // Adiciona no final
        } else if (overData && overData.type === 'card') {
            // Dropped em cima de outro card
            targetColumnId = overData.columnId;
            const targetColumn = (board.columns || []).find(col => col.id === targetColumnId);
            if (targetColumn) {
                targetIndex = (targetColumn.cards || []).findIndex(card => card.id === over.id);
            }
        } else {
            // Fallback: tenta usar o ID do over como coluna
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

        // Verifica se as colunas existem
        const sourceColumn = currentColumns.find(col => col.id === sourceColumnId);
        const targetColumn = currentColumns.find(col => col.id === targetColumnId);

        if (!sourceColumn || !targetColumn) {
            console.error('Coluna não encontrada:', { sourceColumnId, targetColumnId });
            return;
        }

        // Se é a mesma coluna, reordena
        if (sourceColumnId === targetColumnId) {
            const columnCards = [...(sourceColumn.cards || [])];
            const sourceIndex = columnCards.findIndex(card => card.id === draggedCard.id);

            if (sourceIndex === -1) {
                console.error('Card não encontrado na coluna de origem');
                return;
            }

            // Remove da posição original e insere na nova posição
            const [removed] = columnCards.splice(sourceIndex, 1);
            columnCards.splice(targetIndex, 0, removed);

            const updatedColumns = currentColumns.map(col =>
                col.id === sourceColumnId
                    ? { ...col, cards: columnCards }
                    : col
            );

            updateBoardData({
                ...board,
                columns: updatedColumns,
            });
        } else {
            // Move entre colunas diferentes
            const sourceCards = [...(sourceColumn.cards || [])];
            const targetCards = [...(targetColumn.cards || [])];

            // Remove da coluna de origem
            const sourceIndex = sourceCards.findIndex(card => card.id === draggedCard.id);
            if (sourceIndex === -1) {
                console.error('Card não encontrado na coluna de origem');
                return;
            }

            const [removed] = sourceCards.splice(sourceIndex, 1);

            // Adiciona na coluna de destino
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

            updateBoardData({
                ...board,
                columns: updatedColumns,
            });
        }
    }, [board, updateBoardData]);

    // useEffect para sincronização com localStorage
    useEffect(() => {
        syncToStorage();
    }, [allBoards, syncToStorage]);

    // Validação condicional - só depois de todos os hooks
    if (!board) {
        return (
            <div className="board-page">
                <Link to="/" className="btn-secondary">
                    ← Voltar para Home
                </Link>
                <div className="error-message">
                    <h2>Board não encontrado</h2>
                    <p>O board que você está procurando não existe ou foi removido.</p>
                </div>
            </div>
        );
    }

    // Dados para renderização
    const boardColumns = board.columns || [];
    const boardTitle = board.title || 'Board sem título';

    return (
        <div className="board-page">
            {/* Cabeçalho com navegação */}
            <div className="board-header">
                <Link to="/" className="btn-secondary">
                    ← Voltar para Home
                </Link>
                <h2>{boardTitle}</h2>
                <button
                    onClick={handleAddColumn}
                    className="btn-primary"
                    title="Adicionar nova coluna"
                >
                    + Nova Coluna
                </button>
            </div>

            {/* Context de drag-and-drop do @dnd-kit */}
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