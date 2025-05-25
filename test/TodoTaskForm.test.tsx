import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {thunk} from 'redux-thunk';
import TodoTaskForm from '../src/components/TodoTaskForm';
import {addTodo} from '@/store/todoSlice';
import {TodoTaskStatus} from '@/models/todo-task-status';
import globals from "globals";

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

jest.mock('../src/store/todoSlice', () => ({
    addTodo: jest.fn((payload) => ({type: 'todos/addTodo', payload})),
}));

// Simple thunk middleware for testing
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('TodoTaskForm', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            todos: {
                todos: [],
                loading: false,
                error: null,
                totalPages: 0,
                totalItemsCount: 0,
            },
        });
        store.dispatch = jest.fn();
        jest.clearAllMocks();
    });

    it('renders the form with all fields', () => {
        render(
            <Provider store={store}>
                <TodoTaskForm/>
            </Provider>
        );

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Create task/i})).toBeInTheDocument();
    });

    it('submits a new task with valid data', async () => {
        render(
            <Provider store={store}>
                <TodoTaskForm/>
            </Provider>
        );

        fireEvent.change(screen.getByLabelText('Name'), {
            target: {value: 'New Task'},
        });
        fireEvent.change(screen.getByLabelText('Description'), {
            target: {value: 'New Description'},
        });
        fireEvent.change(screen.getByLabelText('Due Date'), {
            target: {value: '2025-05-25'},
        });
        fireEvent.click(screen.getByRole('button', {name: /Create task/i}));

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith(
                addTodo({
                    name: 'New Task',
                    description: 'New Description',
                    dueDate: '2025-05-25',
                    status: TodoTaskStatus.ToDo,
                })
            );
        });

        // Verify form reset
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Description')).toHaveValue('');
        expect(screen.getByLabelText('Due Date')).toHaveValue('');
    });

    it('prevents submission if required fields are missing', async () => {
        render(
            <Provider store={store}>
                <TodoTaskForm/>
            </Provider>
        );

        // Submit without filling required fields
        fireEvent.click(screen.getByRole('button', {name: /Create task/i}));

        await waitFor(() => {
            expect(store.dispatch).not.toHaveBeenCalledWith(addTodo(expect.anything()));
        });

        // Fill only name, not dueDate
        fireEvent.change(screen.getByLabelText('Name'), {
            target: {value: 'New Task'},
        });
        fireEvent.click(screen.getByRole('button', {name: /Create task/i}));

        await waitFor(() => {
            expect(store.dispatch).not.toHaveBeenCalledWith(addTodo(expect.anything()));
        });

        // Fill only dueDate, not name
        fireEvent.change(screen.getByLabelText('Name'), {
            target: {value: ''},
        });
        fireEvent.change(screen.getByLabelText('Due Date'), {
            target: {value: '2025-05-25'},
        });
        fireEvent.click(screen.getByRole('button', {name: /Create task/i}));

        await waitFor(() => {
            expect(store.dispatch).not.toHaveBeenCalledWith(addTodo(expect.anything()));
        });
    });

    it('enforces maxLength on name and description', () => {
        render(
            <Provider store={store}>
                <TodoTaskForm/>
            </Provider>
        );

        const longName = 'A'.repeat(51);
        const longDescription = 'B'.repeat(101);

        fireEvent.change(screen.getByLabelText('Name'), {
            target: {value: longName},
        });
        fireEvent.change(screen.getByLabelText('Description'), {
            target: {value: longDescription},
        });

        expect(screen.getByLabelText('Name')).toHaveValue('A'.repeat(50));
        expect(screen.getByLabelText('Description')).toHaveValue('B'.repeat(100));
    });

    it('enforces min date on dueDate', () => {
        render(
            <Provider store={store}>
                <TodoTaskForm/>
            </Provider>
        );

        const pastDate = '2025-05-22';

        fireEvent.change(screen.getByLabelText('Name'), {
            target: {value: "123"}
        })

        fireEvent.change(screen.getByLabelText('Due Date'), {
            target: {value: pastDate},
        });

        // Browser may not enforce min date, so check component behavior
        fireEvent.click(screen.getByRole('button', {name: /Create task/i}));

        expect(store.dispatch).not.toHaveBeenCalledWith(addTodo(expect.anything()));
    });
});