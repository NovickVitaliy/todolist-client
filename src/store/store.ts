import {configureStore} from "@reduxjs/toolkit"
import todoReducer from "./todoSlice.ts"
export const store = configureStore({
    reducer: {
        todos: todoReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;