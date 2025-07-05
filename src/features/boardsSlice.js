import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

/* Adaptadores de entidade para gerenciar as coleções de quadros normalizadas */
const boardsAdapter = createEntityAdapter();
const columnsAdapter = createEntityAdapter();
const cardsAdapter = createEntityAdapter();

/* Estado inicial para cada entidade */
const initialBoardsState = boardsAdapter.getInitialState();
const initialColumnsState = columnsAdapter.getInitialState();
const initialCardsState = cardsAdapter.getInitialState();

/* Função para encontrar um cartão */
const findCard = (state, cardId) => {
    return state.cards.entities[cardId];
}

const boardsSlice = createSlice({
    name: "boards",
    
    /* O estado é um objeto com 3 parâmetros: boards, columns e cards */
    initialState: {
        boards: initialBoardsState,
        columns: initialColumnsState,
        cards: initialCardsState
    },
    reducers: {
        setAllData (state, action) {
            const { boards, columns, cards } = action.payload;
            boardsAdapter.setAll(state.boards, boards || []);
            columnsAdapter.setAll(state.columns, columns || []);
            cardsAdapter.setAll(state.cards, cards || []);
        },

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
                // Deletar colunas associadas e seus cartões
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

        addColumn: (state, action) => {
            const { boardId, newColumn } = action.payload;
            const board = state.boards.entities[boardId];
            if (board) {
                columnsAdapter.addOne(state.columns, { ...newColumn, cards: newColumn.cards || [] });
                board.columns.push(newColumn.id); // Apenas adiciona o ID
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

        addCard: (state, action) => {
            const { columnId, newCard } = action.payload;
            cardsAdapter.addOne(state.cards, newCard);
            const column = state.columns.entities[columnId];
            if (column) {
                column.cards.push(newCard.id); // Apenas adiciona o ID
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
                cardsAdapter.updateOne(state.cards, {
                    id: cardId,
                    changes: { checklist: newChecklist }
                });
            }
        },
        toggleChecklistItem: (state, action) => {
            const { cardId, itemId } = action.payload;
            const card = state.cards.entities[cardId];
            if (card && card.checklist) {
                const newChecklist = card.checklist.map(item =>
                    item.id === itemId ? { ...item, completed: !item.completed } : item
                );
                cardsAdapter.updateOne(state.cards, {
                    id: cardId,
                    changes: { checklist: newChecklist }
                });
            }
        },
        deleteChecklistItem: (state, action) => {
            const { cardId, itemId } = action.payload;
            const card = state.cards.entities[cardId];
            if (card && card.checklist) {
                const newChecklist = card.checklist.filter(i => i.id !== itemId);
                cardsAdapter.updateOne(state.cards, {
                    id: cardId,
                    changes: { checklist: newChecklist }
                });
            }
        }
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
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    toggleArchiveCard,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem
} = boardsSlice.actions;

export default boardsSlice.reducer;