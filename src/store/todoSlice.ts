import type {TodoTask} from "../models/todo-task.ts";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

interface TodoState {
    todos: TodoTask[];
    loading: boolean;
    error: string | null;
}

const initialState: TodoState = {
    error: null,
    loading: false,
    todos: []
};

const apiUrl = "http://localhost:5"

export const addTodo = createAsyncThunk<TodoTask, TodoTask, { rejectValue: string }>(
    'todos/add',
    async (todoTask, {rejectWithValue}) => {
        try {
            const response = await axios.post("http://localhost:1000/api/todos/", todoTask);
            return {...response.data};
        } catch (error) {
            return rejectWithValue("Error while creating todotask");
        }
    }
);

const todoSlice = createSlice({
    name: "todos",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addTodo.pending, (state: TodoState) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(addTodo.fulfilled, (state: TodoState, action) => {
                state.loading = false;
                state.todos.push(action.payload);
            })
            .addCase(addTodo.rejected, (state: TodoState, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error"
            });
    }
});


export default todoSlice.reducer;