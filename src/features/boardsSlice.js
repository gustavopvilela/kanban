import { createSlice } from '@reduxjs/toolkit';

const initialState = { boards: [] };

const boardsSlice = createSlice({
    name: 'boards',
    initialState,
    reducers: {
        setBoards(state, action) {
            state.boards = action.payload;
        },
        addBoard(state, action) {
            state.boards.push(action.payload);
        },
        updateBoard(state, action) {
            const idx = state.boards.findIndex(b => b.id === action.payload.id);
            if (idx !== -1) state.boards[idx] = action.payload;
        },
        deleteBoard(state, action) {
            console.log('Reducer deleteBoard executado');
            console.log('Estado atual:', state.boards);
            console.log('ID para deletar:', action.payload);
            console.log('Encontrou o board?', state.boards.some(b => b.id === action.payload));

            const novosBoards = state.boards.filter(b => b.id !== action.payload);
            console.log('Boards após filter:', novosBoards);

            state.boards = novosBoards;
        }
    }
});

export const { setBoards, addBoard, updateBoard, deleteBoard } = boardsSlice.actions;
export default boardsSlice.reducer;