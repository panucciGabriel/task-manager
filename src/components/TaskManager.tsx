"use client";

import * as React from "react";
import { Plus, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Task, Priority, Category } from "@/types";
import { TaskItem } from "@/components/TaskItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { clsx } from "clsx";
import { createNewTask, updateTask, deleteTask } from "@/actions/tasks";
import { useOptimistic, startTransition } from "react";

interface TaskManagerProps {
    initialTasks: Task[];
}

type Action =
    | { type: 'ADD'; task: Task }
    | { type: 'UPDATE'; task: Task }
    | { type: 'DELETE'; id: string };

export function TaskManager({ initialTasks }: TaskManagerProps) {
    const [optimisticTasks, dispatchOptimistic] = useOptimistic(
        initialTasks,
        (state, action: Action) => {
            switch (action.type) {
                case 'ADD':
                    return [action.task, ...state];
                case 'UPDATE':
                    return state.map(t => t.id === action.task.id ? action.task : t);
                case 'DELETE':
                    return state.filter(t => t.id !== action.id);
                default:
                    return state;
            }
        }
    );

    // Form State
    const [isFormExpanded, setIsFormExpanded] = React.useState(false);
    const [newTaskText, setNewTaskText] = React.useState("");
    const [newTaskDescription, setNewTaskDescription] = React.useState("");
    const [newTaskPriority, setNewTaskPriority] = React.useState<Priority>("medium");
    const [newTaskCategory, setNewTaskCategory] = React.useState<Category>("personal");
    const [newTaskDueDate, setNewTaskDueDate] = React.useState("");

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();



        if (!newTaskText.trim()) return;

        const newTask: Task = {
            id: crypto.randomUUID(), // Temporary ID for optimistic UI
            text: newTaskText.trim(),
            description: newTaskDescription.trim() || undefined,
            priority: newTaskPriority,
            category: newTaskCategory,
            dueDate: newTaskDueDate ? new Date(newTaskDueDate).getTime() : undefined,
            subtasks: [],
            completed: false,
            createdAt: Date.now(),
        };

        // Optimistic Update
        startTransition(() => {
            dispatchOptimistic({ type: 'ADD', task: newTask });
        });

        // Reset form immediately
        setNewTaskText("");
        setNewTaskDescription("");
        setNewTaskPriority("medium");
        setNewTaskCategory("personal");
        setNewTaskDueDate("");
        setIsFormExpanded(false);

        // Server Action
        try {
            const result = await createNewTask({
                text: newTask.text,
                description: newTask.description,
                priority: newTask.priority,
                category: newTask.category,
                dueDate: newTask.dueDate,
            });
            if (result && !result.success) {
                console.error("Server reported error:", result.error);
                // Rollback logic could go here
            }
        } catch (error) {
            console.error("Failed to create task (Network/System):", error);
        }
    };

    const handleToggleTask = async (id: string) => {
        const task = optimisticTasks.find(t => t.id === id);
        if (!task) return;

        const updatedTask = { ...task, completed: !task.completed };
        startTransition(() => {
            dispatchOptimistic({ type: 'UPDATE', task: updatedTask });
        });

        try {
            const result = await updateTask(id, { completed: updatedTask.completed });
            if (result && !result.success) {
                console.error("Failed to toggle task (Server):", result.error);
            }
        } catch (error) {
            console.error("Failed to toggle task (Network):", error);
        }
    };

    const handleDeleteTask = async (id: string) => {
        startTransition(() => {
            dispatchOptimistic({ type: 'DELETE', id });
        });

        try {
            const result = await deleteTask(id);
            if (result && !result.success) {
                console.error("Failed to delete task (Server):", result.error);
            }
        } catch (error) {
            console.error("Failed to delete task (Network):", error);
        }
    };

    const handleEditTask = async (id: string, updates: Partial<Task>) => {
        const task = optimisticTasks.find(t => t.id === id);
        if (!task) return;

        const updatedTask = { ...task, ...updates };
        startTransition(() => {
            dispatchOptimistic({ type: 'UPDATE', task: updatedTask });
        });

        try {
            const result = await updateTask(id, updates);
            if (result && !result.success) {
                console.error("Failed to update task (Server):", result.error);
            }
        } catch (error) {
            console.error("Failed to update task (Network):", error);
        }
    };

    // Sort tasks: Incomplete first, then by priority (high > medium > low), then by creation date
    const sortedTasks = [...optimisticTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }

        const priorityWeight = { high: 3, medium: 2, low: 1 };
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }

        return b.createdAt - a.createdAt;
    });

    const completedCount = optimisticTasks.filter((t) => t.completed).length;
    const totalCount = optimisticTasks.length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        My Tasks
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Stay organized and get things done.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <SignOutButton />
                </div>
            </header>

            <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-2xl font-bold">Progress</h2>
                        <p className="opacity-90">
                            {completedCount} of {totalCount} tasks completed
                        </p>
                    </div>
                    <div className="text-3xl font-bold">{Math.round(progress)}%</div>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2.5 backdrop-blur-sm">
                    <div
                        className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleAddTask} className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                <div className="p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a new task..."
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onFocus={() => setIsFormExpanded(true)}
                            className={clsx(
                                "flex-1 text-lg bg-transparent border-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white p-0"
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setIsFormExpanded(!isFormExpanded)}
                            className="text-gray-400 hover:text-indigo-500"
                        >
                            {isFormExpanded ? <ChevronUp /> : <ChevronDown />}
                        </button>
                    </div>

                    <div className={clsx(
                        "space-y-4 transition-all duration-300 overflow-hidden",
                        isFormExpanded ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
                    )}>
                        <textarea
                            placeholder="Description (optional)"
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                            rows={3}
                        />

                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                                <div className="flex gap-2">
                                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewTaskPriority(p)}
                                            className={clsx(
                                                "flex-1 py-1.5 text-xs rounded-md border transition-colors capitalize",
                                                newTaskPriority === p
                                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                <select
                                    value={newTaskCategory}
                                    onChange={(e) => setNewTaskCategory(e.target.value as Category)}
                                    className="w-full p-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                >
                                    <option value="personal">Personal</option>
                                    <option value="work">Work</option>
                                    <option value="study">Study</option>
                                </select>
                            </div>

                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={newTaskDueDate}
                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                        className="w-full p-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    />
                                    {!newTaskDueDate && (
                                        <Calendar className="absolute right-2 top-1.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isFormExpanded && (
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="submit"
                            disabled={!newTaskText.trim()}
                            className={clsx(
                                "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
                                newTaskText.trim()
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>
                )}
            </form>

            <div className="space-y-1">
                {optimisticTasks.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 mb-4">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            No tasks yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Add your first task above to get started!
                        </p>
                    </div>
                ) : (
                    sortedTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={handleToggleTask}
                            onDelete={handleDeleteTask}
                            onEdit={handleEditTask}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
