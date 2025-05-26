import React, { useState } from "react";
import type { TodoTask } from "../models/todo-task.ts";
import { TodoTaskStatus } from "../models/todo-task-status.ts";
import type { AppDispatch, RootState } from "../store/store.ts";
import { useDispatch, useSelector } from "react-redux";
import { addTodo } from "../store/todoSlice.ts";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function TodoTaskForm() {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dueDate: '',
    });
    const today = dayjs(new Date()).format('YYYY-MM-DD');

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === 'name') {
            newValue = value.slice(0, 50);
        } else if (name === 'description') {
            newValue = value.slice(0, 100);
        }
        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const todoTask: TodoTask = {
            ...formData,
            dueDate: dayjs(formData.dueDate).format('YYYY-MM-DD'),
            status: TodoTaskStatus.ToDo,
        };
        dispatch(addTodo(todoTask));
        setFormData({ name: '', description: '', dueDate: '' });
    };

    return (
        <div className="todo-wrapper">
            <form className="todo-form" onSubmit={handleSubmit} role="form">
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        maxLength={50}
                        placeholder="Enter todo task name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        maxLength={100}
                        placeholder="Put the description of your task here"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={2}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="dueDate">Due Date</label>
                    <input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        min={today}
                        onChange={handleFormChange}
                        required
                    />
                </div>
                <button className="create-task-btn" type="submit">
                    Create task
                </button>
            </form>
        </div>
    );
}

export default TodoTaskForm;