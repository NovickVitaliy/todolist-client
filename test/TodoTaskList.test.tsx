import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import TodoTaskList from '../src/components/TodoTaskList';
import { getTodos, updateTodo, deleteTodo } from '@/store/todoSlice';
import { TodoTaskStatus } from '@/models/todo-task-status';
import React from "react";

// Mock dayjs
jest.mock('dayjs', () => {
    const actualDayjs = jest.requireActual('dayjs');
    const mockDayjs = jest.fn((date) => {
        const dayjsInstance = actualDayjs(date || '2025-05-23');
        return {
            ...dayjsInstance,
            format: jest.fn((format) => {
                if (format === 'YYYY-MM-DD') {
                    return date ? actualDayjs(date).format(format) : '2025-05-23';
                }
                return dayjsInstance.format(format);
            }),
            valueOf: () => dayjsInstance.valueOf(),
            toISOString: () => dayjsInstance.toISOString(),
        };
    });
    mockDayjs.extend = jest.fn();
    mockDayjs.utc = jest.fn(() => mockDayjs());
    mockDayjs.tz = jest.fn(() => mockDayjs());
    Object.keys(actualDayjs).forEach((key) => {
        if (typeof actualDayjs[key] === 'function' && !mockDayjs[key]) {
            mockDayjs[key] = actualDayjs[key];
        }
    });
    return mockDayjs;
});

// Mock Ant Design components (only Modal and Pagination)
jest.mock('antd', () => {
    const antd = jest.requireActual('antd');
    return {
        ...antd,
        Modal: ({ title, open, onOk, onCancel, children }) =>
            open ? (
                <div data-testid="modal">
                    <h2>{title}</h2>
                    {children}
                    <button data-testid="modal-ok" onClick={onOk}>
                        OK
                    </button>
                    <button data-testid="modal-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            ) : null,
        Pagination: ({ current, onChange, total }) => (
            <div data-testid="pagination" onClick={() => onChange(current + 1)}>
                Page: {current}, Total: {total}
            </div>
        ),
    };
});

// Mock Redux actions
jest.mock('../src/store/todoSlice', () => ({
    getTodos: jest.fn(() => ({ type: 'todos/getTodos' })),
    updateTodo: jest.fn((payload) => ({ type: 'todos/updateTodo', payload })),
    deleteTodo: jest.fn((id) => ({ type: 'todos/deleteTodo', payload: id })),
}));

// Simple thunk middleware for testing
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockTodos = [
    {
        id: 1,
        name: 'Task 1',
        description: 'Description 1',
        dueDate: '2025-05-25',
        status: TodoTaskStatus.ToDo,
    },
    {
        id: 2,
        name: 'Task 2',
        description: 'Description 2',
        dueDate: '2025-05-26',
        status: TodoTaskStatus.InProgress,
    },
];

describe('TodoTaskList', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            todos: {
                todos: mockTodos,
                loading: false,
                error: null,
                totalPages: 1,
                totalItemsCount: 2,
            },
        });
        store.dispatch = jest.fn();
        jest.clearAllMocks();
    });

    it('renders the todo list with tasks', () => {
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        expect(screen.getByText('Your tasks:')).toBeInTheDocument();
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Due To: 2025-05-25')).toBeInTheDocument();
        expect(screen.getByText('Description: Description 1')).toBeInTheDocument();
    });

    it('displays loading state', () => {
        store = mockStore({
            todos: { todos: [], loading: true, error: null, totalPages: 0, totalItemsCount: 0 },
        });
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        expect(screen.getByText('Tasks are being loaded...')).toBeInTheDocument();
    });

    it('displays empty state when no tasks exist', () => {
        store = mockStore({
            todos: { todos: [], loading: false, error: null, totalPages: 0, totalItemsCount: 0 },
        });
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        expect(screen.getByText("You don't have any todo tasks yet")).toBeInTheDocument();
    });

    it('dispatches getTodos on mount and page change', async () => {
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        expect(store.dispatch).toHaveBeenCalledWith(getTodos({ pageNumber: 1, pageSize: 10 }));

        fireEvent.click(screen.getByTestId('pagination'));
        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith(getTodos({ pageNumber: 2, pageSize: 10 }));
        });
    });

    it('opens edit modal and populates form with task data', async () => {
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        expect(editButtons).toHaveLength(2);
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(screen.getByText('Update Todo Task')).toBeInTheDocument();
            expect(screen.getByLabelText('Name')).toHaveValue('Task 1');
            expect(screen.getByLabelText('Description')).toHaveValue('Description 1');
            expect(screen.getByLabelText('Status')).toHaveValue(TodoTaskStatus.ToDo);
            expect(screen.getByLabelText('Due Date')).toHaveValue('2025-05-25');
        });
    });

    it('submits updated task and closes modal', async () => {
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'Updated Task 1' },
        });
        fireEvent.change(screen.getByLabelText('Status'), {
            target: { value: TodoTaskStatus.InProgress },
        });
        fireEvent.click(screen.getByTestId('modal-ok'));

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith(
                updateTodo({
                    id: 1,
                    name: 'Updated Task 1',
                    description: 'Description 1',
                    dueDate: '2025-05-25',
                    status: TodoTaskStatus.InProgress,
                })
            );
        });
        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('opens delete modal and confirms deletion', async () => {
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(screen.getByText("Are you sure you want to delete the task 'Task 1'")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('modal-ok'));
        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith(deleteTodo(1));
            expect(store.dispatch).toHaveBeenCalledWith(getTodos({ pageNumber: 1, pageSize: 10 }));
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    it('cancels delete modal', async () => {
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
        await waitFor(() => {
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('modal-cancel'));
        await waitFor(() => {
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
            expect(store.dispatch).not.toHaveBeenCalledWith(deleteTodo(expect.anything()));
        });
    });

    it('applies correct background color based on status', () => {
        render(
            <Provider store={store}>
                <TodoTaskList />
            </Provider>
        );

        const todoStatus = screen.getByText("Todo");
        const inProgressStatus = screen.getByText("InProgress");

        expect(todoStatus).toHaveStyle({ backgroundColor: 'rgb(245, 34, 45)' });
        expect(inProgressStatus).toHaveStyle({ backgroundColor: '#faad14' });
    });
});