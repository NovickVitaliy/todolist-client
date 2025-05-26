import { TodoTaskStatus } from "../models/todo-task-status.ts";
import type { PaginationProps } from 'antd';
import { Button, Modal, Pagination } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import type { TodoTask } from "../models/todo-task.ts";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store.ts";
import { deleteTodo, getTodos, updateTodo } from "../store/todoSlice.ts";

function TodoTaskList() {
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const dispatch = useDispatch<AppDispatch>();
    const { todos, loading, error, totalPages, totalItemsCount } = useSelector((state: RootState) => state.todos || {});
    const [isUpdateTodoTaskModalOpen, setIsUpdateTodoTaskModalOpen] = useState(false);
    const [isDeleteTodoTaskModalOpen, setIsDeleteTodoTaskModalOpen] = useState(false);
    const [todoTaskToUpdate, setTodoTaskToUpdate] = useState<TodoTask | null>(null);
    const [todoTaskIdToDelete, setTodoTaskIdToDelete] = useState<number | null>(null);
    const [todoTaskToDelete, setTodoTaskToDelete] = useState<TodoTask | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dueDate: '',
        status: TodoTaskStatus.ToDo,
    });
    const today = dayjs(new Date()).format('YYYY-MM-DD');

    useEffect(() => {
        dispatch(getTodos({ pageNumber: currentPage, pageSize }));
    }, [dispatch, currentPage]);

    const onPageChange: PaginationProps["onChange"] = (page) => {
        setCurrentPage(page);
    };

    const onEditTodoTask = (taskId: number) => {
        const todo = todos.find(t => t.id === taskId);
        if (todo) {
            setFormData({
                name: todo.name || '',
                description: todo.description || '',
                dueDate: todo.dueDate || today,
                status: todo.status || TodoTaskStatus.ToDo,
            });
            setTodoTaskToUpdate(todo);
            setIsUpdateTodoTaskModalOpen(true);
        }
    };

    const onDeleteTodoTask = (taskId: number) => {
        const taskToDelete = todos.find(t => t.id === taskId);
        if (taskToDelete) {
            setTodoTaskIdToDelete(taskId);
            setTodoTaskToDelete(taskToDelete);
            setIsDeleteTodoTaskModalOpen(true);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateTodoTaskOk = () => {
        if (!todoTaskToUpdate) return;
        if (!formData.name || !formData.dueDate) {
            alert('Name and Due Date are required');
            return;
        }
        const newTodoTask: TodoTask = {
            id: todoTaskToUpdate.id,
            status: formData.status,
            name: formData.name,
            description: formData.description,
            dueDate: formData.dueDate,
        };
        dispatch(updateTodo(newTodoTask));
        setFormData({ name: '', description: '', dueDate: '', status: TodoTaskStatus.ToDo });
        setIsUpdateTodoTaskModalOpen(false);
        setTodoTaskToUpdate(null);
    };

    const handleDeleteTodoTaskOk = async () => {
        if (todoTaskIdToDelete) {
            await dispatch(deleteTodo(todoTaskIdToDelete));
            await dispatch(getTodos({ pageNumber: currentPage, pageSize }));
            setTodoTaskToDelete(null);
            setTodoTaskIdToDelete(null);
        }
        setIsDeleteTodoTaskModalOpen(false);
    };

    const handleUpdateTodoTaskCancel = () => {
        setFormData({ name: '', description: '', dueDate: '', status: TodoTaskStatus.ToDo });
        setTodoTaskToUpdate(null);
        setIsUpdateTodoTaskModalOpen(false);
    };

    const handleDeleteTodoTaskCancel = () => {
        setTodoTaskIdToDelete(null);
        setTodoTaskToDelete(null);
        setIsDeleteTodoTaskModalOpen(false);
    };

    const getBgColor = (status: string) => {
        switch (status) {
            case "Todo":
                return "#f5222d";
            case "InProgress":
                return "#faad14";
            case "Done":
                return "#52c41a";
            default:
                return "#000";
        }
    };

    return (
        <>
            <div className={'todo-list'}>
                <div className={'todo-list__items'}>
                    <h4 style={{ margin: '0px', marginBottom: '10px' }}>Your tasks:</h4>
                    {loading ? (
                        <p>Tasks are being loaded...</p>
                    ) : (
                        todos.map(t => (
                            <div key={t.id} className={'todo-list__item'}>
                                <div style={{ width: "100%" }}>
                                    <div>
                                        <p style={{
                                            width: "fit-content",
                                            marginBottom: "5px",
                                            marginTop: "5px",
                                            padding: "5px",
                                            borderRadius: "5px",
                                            fontSize: "15px",
                                            color: "white",
                                            backgroundColor: getBgColor(t.status)
                                        }}>
                                            {t.status}
                                        </p>
                                        <b>{t.name}</b>
                                    </div>
                                    <b>Due To: {t.dueDate}</b>
                                    {t.description && (
                                        <p style={{ margin: "0", color: "rgba(145, 142, 142, 0.8)" }}>
                                            Description: {t.description}
                                        </p>
                                    )}
                                </div>
                                <div className={'todo-list__options'}>
                                    <Button onClick={() => onEditTodoTask(t.id)} aria-label="edit">
                                        <EditOutlined />
                                    </Button>
                                    <Button danger onClick={() => onDeleteTodoTask(t.id)} aria-label="delete">
                                        <DeleteOutlined color={'danger'} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                    {loading ? (
                        <></>
                    ) : (
                        todos.length > 0 ? (
                            <Pagination current={currentPage} onChange={onPageChange} total={totalItemsCount} />
                        ) : (
                            <p>You don't have any todo tasks yet</p>
                        )
                    )}
                </div>
            </div>
            <Modal
                title="Update Todo Task"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isUpdateTodoTaskModalOpen}
                onOk={handleUpdateTodoTaskOk}
                onCancel={handleUpdateTodoTaskCancel}
            >
                {todoTaskToUpdate && (
                    <div className="todo-form">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                maxLength={50}
                                id="name"
                                name="name"
                                placeholder="Enter todo task name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                maxLength={100}
                                id="description"
                                name="description"
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
                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleFormChange}
                                style={{ width: 120 }}
                            >
                                <option value={TodoTaskStatus.ToDo}>Todo</option>
                                <option value={TodoTaskStatus.InProgress}>In Progress</option>
                                <option value={TodoTaskStatus.Done}>Done</option>
                            </select>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                title="Delete Todo Task"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isDeleteTodoTaskModalOpen}
                onOk={handleDeleteTodoTaskOk}
                onCancel={handleDeleteTodoTaskCancel}
            >
                {todoTaskToDelete && (
                    <p>Are you sure you want to delete the task '{todoTaskToDelete.name}'</p>
                )}
            </Modal>
        </>
    );
}

export default TodoTaskList;