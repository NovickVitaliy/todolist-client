import React, {useState} from 'react'
import './App.css'
import {Input, DatePicker, Button, Form, Modal, Select,} from "antd";
import type {DatePickerProps, FormProps} from "antd/lib";
import dayjs from "dayjs";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

const {TextArea} = Input;

let idRunner = 1;

type TodoTaskStatus = "Todo" | "InProgress" | "Done"

type TodoTask = {
    id: number;
    name: string;
    description: string;
    dueDate: string;
    status: TodoTaskStatus
};

function App() {
    const [isUpdateTodoTaskModalOpen, setIsUpdateTodoTaskModalOpen] = useState(false);
    const [isDeleteTodoTaskModalOpen, setIsDeleteTodoTaskModalOpen] = useState(false);
    const [todoTaskToUpdate, setTodoTaskToUpdate] = useState<TodoTask | null>(null);
    const [todoTaskIdToDelete, setTodoTaskIdToDelete] = useState<number | null>(null);
    const [todoTaskToDelete, setTodoTaskToDelete] = useState<TodoTask | null>(null);
    const [todos, setTodos] = useState<TodoTask[]>([]);
    const today = dayjs(new Date()).format('YYYY-MM-DD');

    const [createTodoTaskForm] = Form.useForm<TodoTask>();
    const [updateTodoTaskForm] = Form.useForm<TodoTask>();

    const onFinishCreateTodoTask: FormProps<TodoTask>['onFinish'] = (values) => {
        const date = dayjs(values.dueDate).format('YYYY-MM-DD');
        const todoTask: TodoTask = {
            ...values,
            dueDate: date,
            id: idRunner,
            status: "Todo"
        };
        idRunner += 1;
        setTodos(prevTodos => [...prevTodos, todoTask]);
        createTodoTaskForm.resetFields();
    };

    const onFinishUpdateTodoTask: FormProps<TodoTask>['onFinish'] = (values) => {
        if(todoTaskToUpdate !== null){
            console.log(values)
            const date = dayjs(values.dueDate).format('YYYY-MM-DD');
            console.log(date)
            todoTaskToUpdate.name = values.name;
            todoTaskToUpdate.dueDate = date;
            todoTaskToUpdate.description = values.description;
            const filteredTodos = todos.filter(x => x.id !== todoTaskToUpdate?.id);
            setTodos([...filteredTodos, todoTaskToUpdate]);
            updateTodoTaskForm.resetFields();
            setIsUpdateTodoTaskModalOpen(false);
            setTodoTaskToUpdate(null);
        }
    };

    const onDeleteTodoTask = (taskId: number) => {
        const taskToDelete = todos.filter(x => x.id === taskId)[0];
        if(taskToDelete){
            setTodoTaskIdToDelete(taskId);
            setTodoTaskToDelete(taskToDelete);
            setIsDeleteTodoTaskModalOpen(true);
        }
    };

    const onEditTodoTask = (taskId: number) => {
        const todo = todos.filter(t => t.id === taskId)[0];
        if (todo){
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

    const handleDeleteTodoTaskOk = () => {
        if(todoTaskIdToDelete){
            const filteredTodos = todos.filter(x => x.id !== todoTaskIdToDelete);
            setTodos(filteredTodos);
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

    return (
        <>
            <h1>(not) Amazing Todo List</h1>
            <div className='main'>
                <div>
                    <Form
                        form={createTodoTaskForm}
                        className='todo-form'
                        onFinish={onFinishCreateTodoTask}
                        initialValues={{name: '', description: '', dueDate: ''}}
                        layout={"vertical"}
                    >
                        <div className='form-group'>
                            <Form.Item<TodoTask>
                                name='name'
                                label={'Name'}
                                rules={[{required: true, message: "Please give the name for your task"}]}
                            >
                                <Input placeholder={'Enter todo task name'} name='name'></Input>
                            </Form.Item>
                        </div>
                        <div className='form-group'>
                            <Form.Item<TodoTask>
                                name='description'
                                label={'Description'}
                            >
                                <TextArea placeholder={'Put the description of your task here'}
                                          autoSize={{minRows: 2, maxRows: 4}} name='description'/>
                            </Form.Item>
                        </div>
                        <div className='form-group'>
                            <Form.Item<TodoTask>
                                label={'Due Date'}
                                name='dueDate'
                                rules={[{required: true, message: "Due Date is required"}]}
                            >
                                <DatePicker name='dueDate' minDate={dayjs(today)}/>
                            </Form.Item>
                        </div>

                        <Button type={'primary'} htmlType={'submit'}>Create task</Button>
                    </Form>
                </div>

                <div className={'todo-list'}>
                    <div className={'todo-list__items'}>
                        <h4 style={{margin: '0px'}}>Your tasks:</h4>
                        {todos.map(t => (
                            <div key={t.id} className={'todo-list__item'}>
                                <div>
                                    {t.name} | Due To: {t.dueDate} | Status: Todo
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
                    </div>
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
                                    <Input placeholder={'Enter todo task name'} name='name' value={todoTaskToUpdate.name}></Input>
                                </Form.Item>
                            </div>
                            <div className='form-group'>
                                <Form.Item<TodoTask>
                                    name='description'
                                    label={'Description'}
                                >
                                    <TextArea value={todoTaskToUpdate.description} placeholder={'Put the description of your task here'}
                                              autoSize={{minRows: 2, maxRows: 4}} name='description'/>
                                </Form.Item>
                            </div>
                            <div className='form-group'>
                                <Form.Item<TodoTask>
                                    label={'Due Date'}
                                    name='dueDate'
                                    rules={[{required: true, message: "Due Date is required"}]}
                                >
                                    <DatePicker name='dueDate' minDate={dayjs(today)} value={dayjs(todoTaskToUpdate.dueDate)}/>
                                </Form.Item>
                            </div>
                            <div className='form-group'>
                                <Form.Item<TodoTask>
                                    label={'Status'}
                                    name='status'
                                >
                                    <Select
                                        defaultValue="Todo"
                                        style={{ width: 120 }}
                                        options={[
                                            { value: 'Todo', label: 'Todo' },
                                            { value: 'InProgress', label: 'In Progress' },
                                            { value: 'Done', label: 'Done' },
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
        </>
    )
}

export default App
