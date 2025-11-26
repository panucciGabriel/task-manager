"use client";

import * as React from "react";
import { Check, Trash2, Edit2, X, Save, ChevronDown, ChevronUp, Calendar, Plus } from "lucide-react";
import { clsx } from "clsx";
import { Task, Priority, Category, Subtask } from "@/types";
import { formatDate } from "@/utils/date";

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Task>) => void;
}

const priorityColors: Record<Priority, string> = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const categoryColors: Record<Category, string> = {
    personal: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    work: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    study: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Edit state
    const [editText, setEditText] = React.useState(task.text);
    const [editDescription, setEditDescription] = React.useState(task.description || "");
    const [editPriority, setEditPriority] = React.useState<Priority>(task.priority);
    const [editCategory, setEditCategory] = React.useState<Category>(task.category);
    const [editDueDate, setEditDueDate] = React.useState(
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""
    );

    // Subtask state
    const [newSubtaskText, setNewSubtaskText] = React.useState("");

    const handleSave = () => {
        if (editText.trim()) {
            onEdit(task.id, {
                text: editText.trim(),
                description: editDescription.trim(),
                priority: editPriority,
                category: editCategory,
                dueDate: editDueDate ? new Date(editDueDate).getTime() : undefined,
            });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditText(task.text);
        setEditDescription(task.description || "");
        setEditPriority(task.priority);
        setEditCategory(task.category);
        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
        setIsEditing(false);
    };

    const addSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtaskText.trim()) return;

        const newSubtask: Subtask = {
            id: crypto.randomUUID(),
            text: newSubtaskText.trim(),
            completed: false,
        };

        onEdit(task.id, { subtasks: [...(task.subtasks || []), newSubtask] });
        setNewSubtaskText("");
    };

    const toggleSubtask = (subtaskId: string) => {
        const updatedSubtasks = (task.subtasks || []).map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        onEdit(task.id, { subtasks: updatedSubtasks });
    };

    const deleteSubtask = (subtaskId: string) => {
        const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
        onEdit(task.id, { subtasks: updatedSubtasks });
    };

    const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

    if (isEditing) {
        return (
            <div className="p-4 mb-3 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-900/50">
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent"
                        placeholder="Task title"
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                        placeholder="Description (optional)"
                        rows={2}
                    />
                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                            className="p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                        <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as Category)}
                            className="p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                        >
                            <option value="personal">Personal</option>
                            <option value="work">Work</option>
                            <option value="study">Study</option>
                        </select>
                        <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="p-1 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={handleCancel}
                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={clsx(
                "group p-4 mb-3 rounded-lg shadow-sm transition-all duration-200",
                "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700",
                "hover:shadow-md"
            )}
        >
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onToggle(task.id)}
                    className={clsx(
                        "mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        task.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 dark:border-gray-500 hover:border-green-500"
                    )}
                >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span
                            className={clsx(
                                "text-lg font-medium truncate transition-all cursor-pointer",
                                task.completed
                                    ? "text-gray-400 dark:text-gray-500 line-through"
                                    : "text-gray-800 dark:text-gray-100"
                            )}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {task.text}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(task.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", priorityColors[task.priority])}>
                            {task.priority}
                        </span>
                        <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", categoryColors[task.category])}>
                            {task.category}
                        </span>
                        {task.dueDate && (
                            <span className={clsx(
                                "text-xs flex items-center gap-1",
                                isOverdue ? "text-red-500 font-medium" : "text-gray-400 dark:text-gray-500"
                            )}>
                                <Calendar className="w-3 h-3" />
                                {formatDate(task.dueDate)}
                                {isOverdue && " (Overdue)"}
                            </span>
                        )}
                    </div>

                    {/* Expandable Section: Description & Subtasks */}
                    <div className={clsx(
                        "grid transition-all duration-300 ease-in-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
                    )}>
                        <div className="overflow-hidden">
                            {task.description && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    {task.description}
                                </div>
                            )}

                            {/* Subtasks Section */}
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtasks</h4>
                                    <span className="text-xs text-gray-400">
                                        {(task.subtasks || []).filter(st => st.completed).length}/{(task.subtasks || []).length}
                                    </span>
                                </div>

                                <div className="space-y-1 mb-2">
                                    {(task.subtasks || []).map(subtask => (
                                        <div key={subtask.id} className="flex items-center gap-2 group/subtask">
                                            <button
                                                onClick={() => toggleSubtask(subtask.id)}
                                                className={clsx(
                                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                    subtask.completed
                                                        ? "bg-indigo-500 border-indigo-500 text-white"
                                                        : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"
                                                )}
                                            >
                                                {subtask.completed && <Check className="w-3 h-3" />}
                                            </button>
                                            <span className={clsx(
                                                "text-sm flex-1 transition-all",
                                                subtask.completed ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"
                                            )}>
                                                {subtask.text}
                                            </span>
                                            <button
                                                onClick={() => deleteSubtask(subtask.id)}
                                                className="opacity-0 group-hover/subtask:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={addSubtask} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSubtaskText}
                                        onChange={(e) => setNewSubtaskText(e.target.value)}
                                        placeholder="Add subtask..."
                                        className="flex-1 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:border-indigo-500 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newSubtaskText.trim()}
                                        className="p-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {!isExpanded && (task.description || (task.subtasks && task.subtasks.length > 0)) && (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="mt-2 text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-1"
                        >
                            Show details <ChevronDown className="w-3 h-3" />
                        </button>
                    )}
                    {isExpanded && (
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="mt-2 text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-1"
                        >
                            Hide details <ChevronUp className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
