import { createSelector} from "reselect";

const selectBoardsEntities = state => state.boards.boards.entities;
const selectColumnsEntities = state => state.boards.columns.entities;
const selectCardsEntities = state => state.boards.cards.entities;
const selectBoardId = (state, boardId) => boardId;

/* Retorna um array de todos os quadros */
export const selectAllBoards = createSelector(
    [selectBoardsEntities],
    (boards) => Object.values(boards || {})
);

/* Retorna os dados de um único quadro com susas colunas e cartões populados */
export const makeSelectBoard = () => createSelector(
    [selectBoardsEntities, selectColumnsEntities, selectCardsEntities, selectBoardId],
    (boards, columns, cards, boardId) => {
        const boardData = boards[boardId];
        if (!boardData) return null;

        const boardColumns = boardData.columns.map(columnId => {
            const columnData = columns[columnId];
            if (!columnData) return null;

            const columnCards = columnData.cards.map(cardId => cards[cardId]).filter(Boolean);
            return { ...columnData, cards: columnCards };
        }).filter(Boolean);

        return { ...boardData, columns: boardColumns };
    }
);

/* Retorna a contagem de colunas e cartões para um quadro específico */
export const makeSelectBoardStats = () => createSelector(
    [selectColumnsEntities, selectCardsEntities, (state, board) => board],
    (allColumns, allCards, board) => {
        const boardColumnIds = board.columns || [];
        const columnsForThisBoard = boardColumnIds.map(id => allColumns[id]).filter(Boolean);
        const cardsForThisBoard = columnsForThisBoard.flatMap(col => (col.cards || []).map(cardId => allCards[cardId])).filter(Boolean);

        return {
            totalColumns: columnsForThisBoard.length,
            totalCards: cardsForThisBoard.length
        };
    }
);

/* Retorna todos os cartões com data de prazo para a página de calendário */
export const makeSelectCalendarCards = () => createSelector(
    [selectBoardsEntities, selectColumnsEntities, selectCardsEntities, selectBoardId],
    (boards, columns, cards, boardId) => {
        const board = boards[boardId];
        if (!board) return { board: null, cardsWithDueDate: [], allColumns: {} };

        const cardIds = board.columns
            .map(id => columns[id])
            .filter(Boolean)
            .flatMap(col => col.cards || []);

        const cardsWithDueDate = cardIds
            .map(id => cards[id])
            .filter(card => card && card.dueDate);

        return { board, cardsWithDueDate, allColumns: columns };
    }
);

/* Retorna todos os dados necessários para a busca no dashboard */
export const selectSearchData = createSelector(
    [selectBoardsEntities, selectColumnsEntities, selectCardsEntities],
    (boards, columns, cards) => ({
        boards,
        columns,
        cards,
    })
);