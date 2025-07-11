import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

/* Adaptadores de entidade para gerenciar as coleções de quadros normalizadas */
const boardsAdapter = createEntityAdapter();
const columnsAdapter = createEntityAdapter();
const cardsAdapter = createEntityAdapter();

/* Estado inicial para cada entidade */
const initialBoardsState = boardsAdapter.getInitialState();
const initialColumnsState = columnsAdapter.getInitialState();
const initialCardsState = cardsAdapter.getInitialState();

const boardsSlice = createSlice({
    name: "boards",
    
    initialState: {
        boards: initialBoardsState,
        columns: initialColumnsState,
        cards: initialCardsState,
        isMultiSelectEnabled: false,
        selectedCardIds: [],
    },
    reducers: {
        setAllData (state, action) {
            const { boards, columns, cards } = action.payload;
            boardsAdapter.setAll(state.boards, boards || []);
            columnsAdapter.setAll(state.columns, columns || []);
            cardsAdapter.setAll(state.cards, cards || []);
        },

        // --- Ações do Quadro ---
        addBoard: (state, action) => {
            const board = action.payload;
            boardsAdapter.addOne(state.boards, { ...board, columns: board.columns || [] });
        },
        updateBoardDetails: (state, action) => {
            const { boardId, title, description } = action.payload;
            boardsAdapter.updateOne(state.boards, {
                id: boardId,
                changes: { title, description }
            });
        },
        deleteBoard: (state, action) => {
            const boardId = action.payload;
            const board = state.boards.entities[boardId];
            if (board) {
                board.columns.forEach(columnId => {
                    const column = state.columns.entities[columnId];
                    if (column && column.cards) {
                        cardsAdapter.removeMany(state.cards, column.cards);
                    }
                    columnsAdapter.removeOne(state.columns, columnId);
                });
                boardsAdapter.removeOne(state.boards, boardId);
            }
        },

        // --- Ações da Coluna ---
        addColumn: (state, action) => {
            const { boardId, newColumn } = action.payload;
            const board = state.boards.entities[boardId];
            if (board) {
                columnsAdapter.addOne(state.columns, { ...newColumn, cards: newColumn.cards || [] });
                board.columns.push(newColumn.id);
            }
        },
        updateColumn: (state, action) => {
            const { columnId, title } = action.payload;
            columnsAdapter.updateOne(state.columns, {
                id: columnId,
                changes: { title }
            });
        },
        deleteColumn: (state, action) => {
            const { boardId, columnId } = action.payload;
            const column = state.columns.entities[columnId];
            if (column && column.cards) {
                cardsAdapter.removeMany(state.cards, column.cards);
            }
            columnsAdapter.removeOne(state.columns, columnId);
            const board = state.boards.entities[boardId];
            if (board) {
                board.columns = board.columns.filter(id => id !== columnId);
            }
        },
        moveColumn: (state, action) => {
            const { boardId, sourceIndex, destinationIndex } = action.payload;
            const board = state.boards.entities[boardId];
            if (board) {
                const [movedColumn] = board.columns.splice(sourceIndex, 1);
                board.columns.splice(destinationIndex, 0, movedColumn);
            }
        },

        // --- Ações do Cartão ---
        addCard: (state, action) => {
            const { columnId, newCard } = action.payload;
            cardsAdapter.addOne(state.cards, newCard);
            const column = state.columns.entities[columnId];
            if (column) {
                column.cards.push(newCard.id);
            }
        },
        updateCard: (state, action) => {
            const { updatedCard } = action.payload;
            cardsAdapter.updateOne(state.cards, {
                id: updatedCard.id,
                changes: updatedCard
            });
        },
        deleteCard: (state, action) => {
            const { columnId, cardId } = action.payload;
            cardsAdapter.removeOne(state.cards, cardId);
            const column = state.columns.entities[columnId];
            if (column) {
                column.cards = column.cards.filter(id => id !== cardId);
            }
        },
        moveCard: (state, action) => {
            const { sourceColumnId, destColumnId, sourceIndex, destIndex, cardId } = action.payload;
            const sourceColumn = state.columns.entities[sourceColumnId];
            if (sourceColumn) {
                sourceColumn.cards.splice(sourceIndex, 1);
            }
            const destColumn = state.columns.entities[destColumnId];
            if (destColumn) {
                destColumn.cards.splice(destIndex, 0, cardId);
            }
        },
        toggleArchiveCard: (state, action) => {
            const { cardId } = action.payload;
            const card = state.cards.entities[cardId];
            if (card) {
                cardsAdapter.updateOne(state.cards, {
                    id: cardId,
                    changes: { isArchived: !card.isArchived }
                });
            }
        },

        addChecklistItem: (state, action) => {
            const { cardId, newItem } = action.payload;
            const card = state.cards.entities[cardId];
            if (card) {
                const newChecklist = [...(card.checklist || []), newItem];
                cardsAdapter.updateOne(state.cards, { id: cardId, changes: { checklist: newChecklist } });
            }
        },
        toggleChecklistItem: (state, action) => {
            const { cardId, itemId } = action.payload;
            const card = state.cards.entities[cardId];
            if (card && card.checklist) {
                const newChecklist = card.checklist.map(item =>
                    item.id === itemId ? { ...item, completed: !item.completed } : item
                );
                cardsAdapter.updateOne(state.cards, { id: cardId, changes: { checklist: newChecklist } });
            }
        },
        deleteChecklistItem: (state, action) => {
            const { cardId, itemId } = action.payload;
            const card = state.cards.entities[cardId];
            if (card && card.checklist) {
                const newChecklist = card.checklist.filter(i => i.id !== itemId);
                cardsAdapter.updateOne(state.cards, { id: cardId, changes: { checklist: newChecklist } });
            }
        },

        toggleMultiSelectMode: (state) => {
            state.isMultiSelectEnabled = !state.isMultiSelectEnabled;
            if (!state.isMultiSelectEnabled) {
                state.selectedCardIds = [];
            }
        },
        toggleCardSelection: (state, action) => {
            const cardId = action.payload;
            const index = state.selectedCardIds.indexOf(cardId);
            if (index >= 0) {
                state.selectedCardIds.splice(index, 1);
            }
            else {
                state.selectedCardIds.push(cardId);
            }
        },
        clearCardSelection: (state) => {
            state.selectedCardIds = [];
        },
        archiveSelectedCards: (state) => {
            const updates = state.selectedCardIds.map(id => {
                const card = state.cards.entities[id];
                return {
                    id,
                    changes: { isArchived: !card.isArchived }
                };
            });
            cardsAdapter.updateMany(state.cards, updates);
            state.selectedCardIds = [];
            state.isMultiSelectEnabled = false;
        },
        deleteSelectedCards: (state) => {
            const cardIdsToDelete = [...state.selectedCardIds];
            Object.values(state.columns.entities).forEach(column => {
                if (column.cards) {
                    column.cards = column.cards.filter(id => !cardIdsToDelete.includes(id));
                }
            });

            cardsAdapter.removeMany(state.cards, cardIdsToDelete);
            state.selectedCardIds = [];
            state.isMultiSelectEnabled = false;
        },
    }
});

export const {
    setAllData,
    addBoard,
    updateBoardDetails,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    toggleArchiveCard,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    toggleMultiSelectMode,
    toggleCardSelection,
    clearCardSelection,
    archiveSelectedCards,
    deleteSelectedCards,
} = boardsSlice.actions;

export default boardsSlice.reducer;