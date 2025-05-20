import React, {useState} from 'react'
import './App.css'
import {Input, DatePicker, Button, Form,} from "antd";
import type {DatePickerProps, FormProps} from "antd/lib";
import dayjs from "dayjs";

const {TextArea} = Input;

type TodoTask = {
    name: string;
    description: string;
    dueDate: string;
};

function App() {
    const [todos, setTodos] = useState<TodoTask[]>([]);
    const today = new Date().toISOString().split('T')[0];

    const [form] = Form.useForm<TodoTask>();

    const onFinish: FormProps<TodoTask>['onFinish'] = (values) => {
        const date = new Date(values.dueDate.toString()).toISOString().split('T')[0];
        const todoTask: TodoTask = {
            ...values,
            dueDate: date
        };
        setTodos(prevTodos => [...prevTodos, todoTask]);
        form.resetFields();
    };

    const onFinishFailed: FormProps<TodoTask>['onFinishFailed'] = (errorInfo) => {
        console.log(errorInfo)
    };

    return (
        <>
            <h1>(not) Amazing Todo List</h1>
            <div className='main'>
                <div>

                    <Form
                        form={form}
                        className='todo-form'
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
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
                                <TextArea placeholder={'Put the description of your task here'} autoSize={{minRows: 2, maxRows: 4}} name='description'/>
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
                            <div className={'todo-list__item'}>
                                <div>
                                    {t.name} | Due To: {t.dueDate} | Status: Todo
                                </div>
                                <div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
