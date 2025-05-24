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
        }
    }
});

export const { setBoards, addBoard, updateBoard } = boardsSlice.actions;
export default boardsSlice.reducer;