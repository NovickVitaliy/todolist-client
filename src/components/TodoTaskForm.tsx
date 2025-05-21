import {Button, DatePicker, Form, Input} from "antd";
import dayjs from "dayjs";
import React, {useState} from "react";
import TextArea from "antd/es/input/TextArea";
import type {TodoTask} from "../models/todo-task.ts";
import {FormProps} from "antd/lib";
import {TodoTaskStatus} from "../models/todo-task-status.ts";
import type {AppDispatch, RootState} from "../store/store.ts";
import {useDispatch, useSelector} from "react-redux";
import {addTodo} from "../store/todoSlice.ts";

let idRunner = 1;

function TodoTaskForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { todos, loading, error } = useSelector((state: RootState) => state.todos);
    // const [todos, setTodos] = useState<TodoTask[]>([]);
    const [createTodoTaskForm] = Form.useForm<TodoTask>();
    const today = dayjs(new Date()).format('YYYY-MM-DD');

    const onFinishCreateTodoTask: FormProps<TodoTask>['onFinish'] = (values) => {
        const date = dayjs(values.dueDate).format('YYYY-MM-DD');
        const todoTask: TodoTask = {
            ...values,
            dueDate: date,
            id: idRunner,
            status: TodoTaskStatus.ToDo
        };
        idRunner += 1;
        dispatch(addTodo(todoTask));
        // setTodos(prevTodos => [...prevTodos, todoTask]);
        createTodoTaskForm.resetFields();
    };


    return (<div className='todo-wrapper'>
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

            <Button className='create-task-btn' type={'primary'} htmlType={'submit'}>Create task</Button>
        </Form>
    </div>);
}


export default TodoTaskForm;