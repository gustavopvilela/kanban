import { createSlice } from '@reduxjs/toolkit';

const initialState = { boards: [] };

// Função auxiliar para encontrar um cartão específico dentro do estado
const findCard = (state, boardId, columnId, cardId) => {
    const board = state.boards.find(b => b.id === boardId);
    if (!board || !board.columns) return null;

    const column = board.columns.find(c => c.id === columnId);
    if (!column || !column.cards) return null;
    
    const card = column.cards.find(c => c.id === cardId);
    return card || null;
}

const boardsSlice = createSlice({
    name: 'boards',
    initialState,
    reducers: {
        // --- Reducers de Quadros (Boards) ---
        setBoards(state, action) {
            state.boards = action.payload;
        },
        addBoard(state, action) {
            state.boards.push(action.payload);
        },
        // NOVA AÇÃO para atualizar detalhes de um quadro
        updateBoardDetails(state, action) {
            const { boardId, title, description } = action.payload;
            const board = state.boards.find(b => b.id === boardId);
            if (board) {
                board.title = title;
                board.description = description;
            }
        },
        deleteBoard(state, action) {
            state.boards = state.boards.filter(b => b.id !== action.payload);
        },

        // --- Reducers de Colunas (Columns) ---
        addColumn(state, action) {
            const { boardId, newColumn } = action.payload;
            const board = state.boards.find(b => b.id === boardId);
            if (board) {
                if (!board.columns) board.columns = [];
                board.columns.push(newColumn);
            }
        },
        deleteColumn(state, action) {
            const { boardId, columnId } = action.payload;
            const board = state.boards.find(b => b.id === boardId);
            if (board && board.columns) {
                board.columns = board.columns.filter(c => c.id !== columnId);
            }
        },

        // --- Reducers de Cartões (Cards) ---
        addCard(state, action) {
            const { boardId, columnId, newCard } = action.payload;
            const board = state.boards.find(b => b.id === boardId);
            if (board && board.columns) {
                const column = board.columns.find(c => c.id === columnId);
                if (column) {
                    if (!column.cards) column.cards = [];
                    column.cards.push(newCard);
                }
            }
        },
        updateCard(state, action) {
            const { boardId, columnId, updatedCard } = action.payload;
            const board = state.boards.find(b => b.id === boardId);
            if (board && board.columns) {
                const column = board.columns.find(c => c.id === columnId);
                if (column && column.cards) {
                    const cardIndex = column.cards.findIndex(c => c.id === updatedCard.id);
                    if (cardIndex !== -1) {
                        column.cards[cardIndex] = { ...column.cards[cardIndex], ...updatedCard };
                    }
                }
            }
        },
        deleteCard(state, action) {
            const { boardId, columnId, cardId } = action.payload;
            const board = state.boards.find(b => b.id === boardId);
            if (board && board.columns) {
                const column = board.columns.find(c => c.id === columnId);
                if (column && column.cards) {
                    column.cards = column.cards.filter(card => card.id !== cardId);
                }
            }
        },
        moveCard(state, action) {
            const { boardId, sourceColumnId, destColumnId, sourceIndex, destIndex } = action.payload;
            const board = state.boards.find(b => b.id === boardId);

            if (!board || !board.columns) return;

            const sourceColumn = board.columns.find(c => c.id === sourceColumnId);
            const destColumn = board.columns.find(c => c.id === destColumnId);

            if (!sourceColumn || !destColumn) return;
            
            const [movedCard] = sourceColumn.cards.splice(sourceIndex, 1);

            if (movedCard) {
                if (!destColumn.cards) destColumn.cards = [];
                destColumn.cards.splice(destIndex, 0, movedCard);
            }
        },
        
        // --- Reducers específicos para as novas funcionalidades ---
        toggleArchiveCard(state, action) {
            const { boardId, columnId, cardId } = action.payload;
            const card = findCard(state, boardId, columnId, cardId);
            if (card) {
                card.isArchived = !card.isArchived;
            }
        },
        addChecklistItem(state, action) {
            const { boardId, columnId, cardId, newItem } = action.payload;
            const card = findCard(state, boardId, columnId, cardId);
            if (card) {
                if (!card.checklist) card.checklist = [];
                card.checklist.push(newItem);
            }
        },
        toggleChecklistItem(state, action) {
            const { boardId, columnId, cardId, itemId } = action.payload;
            const card = findCard(state, boardId, columnId, cardId);
            if (card && card.checklist) {
                const item = card.checklist.find(i => i.id === itemId);
                if (item) {
                    item.completed = !item.completed;
                }
            }
        },
        deleteChecklistItem(state, action) {
            const { boardId, columnId, cardId, itemId } = action.payload;
            const card = findCard(state, boardId, columnId, cardId);
            if (card && card.checklist) {
                card.checklist = card.checklist.filter(i => i.id !== itemId);
            }
        }
    }
});

export const { 
    setBoards, 
    addBoard, 
    updateBoardDetails, // Exporta a nova ação
    deleteBoard,
    addColumn,
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
