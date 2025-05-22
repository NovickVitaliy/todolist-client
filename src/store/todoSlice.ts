import type {TodoTask} from "../models/todo-task.ts";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import { context, propagation, trace } from '@opentelemetry/api';
interface TodoState {
    todos: TodoTask[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItemsCount: number;
}

const initialState: TodoState = {
    error: null,
    loading: false,
    todos: [],
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItemsCount: 0
};

const apiUrl = "http://localhost:5"
const tracer = trace.getTracer('react-client');
export const addTodo = createAsyncThunk<TodoTask, TodoTask, { rejectValue: string }>(
    'todos/add',
    async (todoTask, {rejectWithValue}) => {
        const span = tracer.startSpan('createTodo');

        return await context.with(trace.setSpan(context.active(), span), async () => {
            const headers: Record<string, string> = {};
            propagation.inject(context.active(), headers); // inject W3C trace headers

            try {
                const response = await axios.post("http://localhost:8090/api/todos/", todoTask, { headers });
                span.setAttribute('http.status_code', response.status);
                span.end();
                return { ...response.data };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                span.setAttribute('error', true);
                span.setAttribute('error.message', errorMessage);
                span.end();
                return rejectWithValue("Error while creating the todo task");
            }
        });
    }
);

export const updateTodo = createAsyncThunk<TodoTask, TodoTask, { rejectValue: string }>(
    'todos/update',
    async (todoTask: TodoTask, {rejectWithValue}) => {
        const span = tracer.startSpan('updateTodo');

        return await context.with(trace.setSpan(context.active(), span), async () => {
            const headers: Record<string, string> = {};
            propagation.inject(context.active(), headers); // inject W3C trace headers

            try {
                const response = await axios.put(`http://localhost:8090/api/todos/${todoTask.id}`, todoTask, { headers });
                span.setAttribute('http.status_code', response.status);
                span.end();
                return { ...response.data };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                span.setAttribute('error', true);
                span.setAttribute('error.message', errorMessage);
                span.end();
                return rejectWithValue("Error while updating the todo task");
            }
        });
    }
);

export const deleteTodo = createAsyncThunk<number, void, { rejectValue: string }>(
    'todos/delete',
    async (todoTaskId: number, {rejectWithValue}) => {
        const span = tracer.startSpan('deleteTodo');

        return await context.with(trace.setSpan(context.active(), span), async () => {
            const headers: Record<string, string> = {};
            propagation.inject(context.active(), headers); // inject W3C trace headers

            try {
                const response = await axios.delete(`http://localhost:8090/api/todos/${todoTaskId}`, { headers });
                span.setAttribute('http.status_code', response.status);
                span.end();
                return todoTaskId;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                span.setAttribute('error', true);
                span.setAttribute('error.message', errorMessage);
                span.end();
                return rejectWithValue("Error while deleting the todo task");
            }
        });
    }
);

export const getTodos = createAsyncThunk<{ pageNumber: number, pageSize: number }, void, { rejectValue: string }>(
    'todos/get',
    async (pageRequest: { pageNumber: number, pageSize: number }, {rejectWithValue}) => {
        const span = tracer.startSpan('getTodos');

        return await context.with(trace.setSpan(context.active(), span), async () => {
            const headers: Record<string, string> = {};
            propagation.inject(context.active(), headers); // inject W3C trace headers

            try {
                const response = await axios.get(
                    `http://localhost:8090/api/todos?pageNumber=${pageRequest.pageNumber}&pageSize=${pageRequest.pageSize}`,
                    { headers }
                );
                span.setAttribute('http.status_code', response.status);
                span.end();
                return { ...response.data };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                span.setAttribute('error', true);
                span.setAttribute('error.message', errorMessage);
                span.end();
                return rejectWithValue("Error while deleting the todo task");
            }
        });
    }
);

const todoSlice = createSlice({
    name: "todos",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addTodo.pending, (state: TodoState) => {

        }).addCase(addTodo.fulfilled, (state: TodoState, action) => {
            state.loading = false;
            if(state.todos.length < state.pageSize){
                state.todos.push(action.payload);
            }
            state.totalItemsCount += 1;
            state.todos = state.todos.sort((a, b) => a.id - b.id);
        }).addCase(addTodo.rejected, (state: TodoState, action) => {
            state.loading = false;
            state.error = action.payload ?? "Unknown error"
        }).addCase(updateTodo.pending, (state: TodoState) => {

        }).addCase(updateTodo.fulfilled, (state: TodoState, action) => {
            const filteredTodos = state.todos.filter(t => t.id !== action.payload.id);
            filteredTodos.push(action.payload);
            state.todos = filteredTodos;
            state.todos = state.todos.sort((a, b) => a.id - b.id);
        }).addCase(updateTodo.rejected, (state: TodoState, action) => {
            state.error = action.payload ?? "Unknown error"
        }).addCase(deleteTodo.pending, (state) => {

        }).addCase(deleteTodo.fulfilled, (state: TodoState, action) => {
            state.todos = state.todos.filter(t => t.id !== action.payload);
            state.totalItemsCount -= 1;
            state.todos = state.todos.sort((a, b) => a.id - b.id);
        }).addCase(getTodos.pending, (state: TodoState) => {
            state.loading = true;
        }).addCase(getTodos.fulfilled, (state: TodoState, action) => {
            state.loading = false;
            state.todos = action.payload.items;
            state.pageSize = action.payload.pageSize;
            state.currentPage = action.payload.pageNumber;
            state.totalPages = action.payload.totalPages;
            state.pageSize = action.payload.itemsPerPage;
            state.totalItemsCount = action.payload.totalItemsCount;
        });
    }
});


export default todoSlice.reducer;