import React, {useState} from 'react'
import './App.css'
import {Button, DatePicker, Form, Input, Modal, Select,} from "antd";
import type {FormProps} from "antd/lib";
import dayjs from "dayjs";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import type {TodoTask} from "./models/todo-task.ts";
import {TodoTaskStatus} from "./models/todo-task-status.ts";
import TodoTaskForm from "./components/TodoTaskForm.tsx";
import TodoTaskList from "./components/TodoTaskList.tsx";

const {TextArea} = Input;


function App() {
    return (
        <>
            <h1>(not) Amazing Todo List</h1>
            <div className='main'>
                <TodoTaskForm></TodoTaskForm>
                <TodoTaskList></TodoTaskList>
            </div>
        </>
    )
}

export default App
