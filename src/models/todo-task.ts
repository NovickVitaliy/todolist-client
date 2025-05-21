import type {TodoTaskStatus} from "./todo-task-status.ts";

export interface TodoTask{
    id: number;
    name: string;
    description: string;
    dueDate: string;
    status: TodoTaskStatus
}