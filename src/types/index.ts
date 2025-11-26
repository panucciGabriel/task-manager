export type Priority = 'low' | 'medium' | 'high';
export type Category = 'personal' | 'work' | 'study';

export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    text: string;
    description?: string;
    priority: Priority;
    category: Category;
    dueDate?: number;
    subtasks: Subtask[];
    completed: boolean;
    createdAt: number;
}
