import {TodoTaskStatus} from "../models/todo-task-status.ts";
import type {PaginationProps} from 'antd';
import {Button, DatePicker, Form, Input, Modal, Pagination, Select} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import type {TodoTask} from "../models/todo-task.ts";
import dayjs from "dayjs";
import {FormProps} from "antd/lib";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../store/store.ts";
import {deleteTodo, getTodos, updateTodo} from "../store/todoSlice.ts";
import TextArea from "antd/es/input/TextArea";

function TodoTaskList() {
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const dispatch = useDispatch<AppDispatch>();
    const { todos, loading, error, totalPages, totalItemsCount } = useSelector((state: RootState) => state.todos);
    const [isUpdateTodoTaskModalOpen, setIsUpdateTodoTaskModalOpen] = useState(false);
    const [isDeleteTodoTaskModalOpen, setIsDeleteTodoTaskModalOpen] = useState(false);
    const [todoTaskToUpdate, setTodoTaskToUpdate] = useState<TodoTask | null>(null);
    const [todoTaskIdToDelete, setTodoTaskIdToDelete] = useState<number | null>(null);
    const [todoTaskToDelete, setTodoTaskToDelete] = useState<TodoTask | null>(null);
    const [updateTodoTaskForm] = Form.useForm<TodoTask>();
    const today = dayjs(new Date()).format('YYYY-MM-DD');

    useEffect(() => {
        dispatch(getTodos({pageNumber: currentPage, pageSize: pageSize}));
    }, [dispatch, currentPage]);

    const onPageChange: PaginationProps["onChange"] = (page) => {
        setCurrentPage(page);
    };

    const onFinishUpdateTodoTask: FormProps<TodoTask>['onFinish'] = (values) => {
        if (todoTaskToUpdate !== null) {
            const newTodoTask: TodoTask = {
                id: todoTaskToUpdate.id,
                status: values.status,
                name: values.name,
                description: values.description,
                dueDate: dayjs(values.dueDate).format('YYYY-MM-DD')
            };
            dispatch(updateTodo(newTodoTask))
            updateTodoTaskForm.resetFields();
            setIsUpdateTodoTaskModalOpen(false);
            setTodoTaskToUpdate(null);
        }
    };

    const onDeleteTodoTask = (taskId: number) => {
        const taskToDelete = todos.filter(x => x.id === taskId)[0];
        if (taskToDelete) {
            setTodoTaskIdToDelete(taskId);
            setTodoTaskToDelete(taskToDelete);
            setIsDeleteTodoTaskModalOpen(true);
        }
    };

    const onEditTodoTask = (taskId: number) => {
        const todo = todos.filter(t => t.id === taskId)[0];
        if (todo) {
            updateTodoTaskForm.setFieldsValue({
                name: todo.name,
                description: todo.description,
                dueDate: dayjs(todo.dueDate),
                status: todo.status
            });
            setTodoTaskToUpdate(todo);
            setIsUpdateTodoTaskModalOpen(true);
        }
    };


    const handleUpdateTodoTaskOk = () => {
        updateTodoTaskForm.submit();
        setTodoTaskToUpdate(null);
        setIsUpdateTodoTaskModalOpen(false);
    }

    const handleDeleteTodoTaskOk = async () => {
        if (todoTaskIdToDelete) {
            await dispatch(deleteTodo(todoTaskIdToDelete))
            await dispatch(getTodos({pageNumber: currentPage, pageSize: pageSize}))
            setTodoTaskToDelete(null);
            setTodoTaskIdToDelete(null);
        }
        setIsDeleteTodoTaskModalOpen(false);
    }

    const handleUpdateTodoTaskDelete = () => {
        setTodoTaskToUpdate(null);
        setIsUpdateTodoTaskModalOpen(false);
    }

    const handleDeleteTodoTaskCancel = () => {
        setTodoTaskIdToDelete(null);
        setTodoTaskToDelete(null);
        setIsDeleteTodoTaskModalOpen(false);
    }

    const getBgColor = (status) => {
        switch (status){
            case "Todo":
                return "#f5222d";
            case "InProgress":
                return "#faad14";
            case "Done":
                return "#52c41a"
        }
    };

    return (<>
        <div className={'todo-list'}>
            <div className={'todo-list__items'}>
                <h4 style={{margin: '0px', marginBottom: '10px'}}>Your tasks:</h4>
                {loading ? (<p>Tasks are being loaded...</p>) : todos.map(t => (
                    <div key={t.id} className={'todo-list__item'}>
                        <div style={{width: "100%"}}>
                            <div>
                                <p style={{width: "fit-content", marginBottom: "5px", marginTop: "5px", padding: "5px", borderRadius: "5px", fontSize: "15px", color: "white", backgroundColor: getBgColor(t.status)}}>{t.status}</p>
                                <b>{t.name}</b>
                            </div>
                            <b>Due To: {t.dueDate}</b>
                            {t.description && <p style={{margin: "0", color: "rgba(145, 142, 142, 0.8)"}}>Description: {t.description}</p>}
                        </div>
                        <div className={'todo-list__options'}>
                            <Button onClick={() => onEditTodoTask(t.id)}>
                                <EditOutlined/>
                            </Button>
                            <Button danger onClick={() => onDeleteTodoTask(t.id)}>
                                <DeleteOutlined color={'danger'}/>
                            </Button>
                        </div>
                    </div>
                ))}
                {loading
                    ? (<></>)
                    : (todos.length > 0
                        ? <Pagination current={currentPage} onChange={onPageChange} total={totalItemsCount}></Pagination>
                        : <p>You don't have any todo tasks yet</p>)}
            </div>
        </div>
        <Modal
            title="Update Todo Task"
            closable={{'aria-label': 'Custom Close Button'}}
            open={isUpdateTodoTaskModalOpen}
            onOk={handleUpdateTodoTaskOk}
            onCancel={handleUpdateTodoTaskDelete}
        >
            {todoTaskToUpdate && (<>

                    <Form
                        form={updateTodoTaskForm}
                        className='todo-form'
                        onFinish={onFinishUpdateTodoTask}
                        layout={"vertical"}
                    >
                        <div className='form-group'>
                            <Form.Item<TodoTask>
                                name='name'
                                label={'Name'}
                                rules={[{required: true, message: "Please give the name for your task"}]}
                            >
                                <Input placeholder={'Enter todo task name'} name='name'
                                       value={todoTaskToUpdate.name}></Input>
                            </Form.Item>
                        </div>
                        <div className='form-group'>
                            <Form.Item<TodoTask>
                                name='description'
                                label={'Description'}
                            >
                                <TextArea value={todoTaskToUpdate.description}
                                          placeholder={'Put the description of your task here'}
                                          autoSize={{minRows: 2, maxRows: 4}} name='description'/>
                            </Form.Item>
                        </div>
                        <div className='form-group'>
                            <Form.Item<TodoTask>
                                label={'Due Date'}
                                name='dueDate'
                                rules={[{required: true, message: "Due Date is required"}]}
                            >
                                <DatePicker name='dueDate' minDate={dayjs(today)}
                                            value={dayjs(todoTaskToUpdate.dueDate)}/>
                            </Form.Item>
                        </div>
                        <div className='form-group'>
                            <Form.Item<TodoTask>
                                label={'Status'}
                                name='status'
                            >
                                <Select
                                    defaultValue="Todo"
                                    style={{width: 120}}
                                    options={[
                                        {value: TodoTaskStatus.ToDo, label: 'Todo'},
                                        {value: TodoTaskStatus.InProgress, label: 'In Progress'},
                                        {value: TodoTaskStatus.Done, label: 'Done'},
                                    ]}
                                />
                            </Form.Item>
                        </div>
                    </Form>
                </>
            )}
        </Modal>
        <Modal
            title="Delete Todo Task"
            closable={{'aria-label': 'Custom Close Button'}}
            open={isDeleteTodoTaskModalOpen}
            onOk={handleDeleteTodoTaskOk}
            onCancel={handleDeleteTodoTaskCancel}
        >
            {todoTaskToDelete && (<>
                    <p>Are you sure you want to delete the task '{todoTaskToDelete.name}'</p>
                </>
            )}
        </Modal>
    </>);
}

export default TodoTaskList;