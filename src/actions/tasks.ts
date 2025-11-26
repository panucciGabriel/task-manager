'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Task, Priority, Category } from '@/types';

export async function getTasks() {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        // User exists in session but not in DB (e.g. after DB migration)
        // Return empty tasks to allow page to render, user should re-login/register
        return [];
    }

    const tasks = await prisma.task.findMany({
        where: { userId: user.id },
        include: { subtasks: true },
        orderBy: { createdAt: 'desc' },
    });

    return tasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? task.dueDate.getTime() : undefined,
        createdAt: task.createdAt.getTime(),
        priority: task.priority as Priority,
        category: task.category as Category,
    }));
}

export async function createNewTask(data: {
    text: string;
    description?: string;
    priority: Priority;
    category: Category;
    dueDate?: number;
}) {
    console.log("createNewTask: START", data);
    try {
        const session = await auth();

        if (!session?.user?.email) {
            throw new Error('Unauthorized: No session');
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            throw new Error('User not found in DB');
        }

        const newTask = await prisma.task.create({
            data: {
                text: data.text,
                description: data.description,
                priority: data.priority,
                category: data.category,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                userId: user.id,
            },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to create task:", error);
        return { success: false, error: String(error) };
    }
}

export async function updateTask(id: string, updates: Partial<Task>) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            throw new Error('Unauthorized');
        }

        const task = await prisma.task.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!task || task.user.email !== session.user.email) {
            throw new Error('Unauthorized or Task not found');
        }

        const { subtasks, ...simpleUpdates } = updates;

        await prisma.$transaction(async (tx: any) => {
            await tx.task.update({
                where: { id },
                data: {
                    ...simpleUpdates,
                    dueDate: simpleUpdates.dueDate ? new Date(simpleUpdates.dueDate) : simpleUpdates.dueDate === undefined ? undefined : null,
                }
            });

            if (subtasks) {
                await tx.subtask.deleteMany({ where: { taskId: id } });
                if (subtasks.length > 0) {
                    await tx.subtask.createMany({
                        data: subtasks.map((s: any) => ({
                            id: s.id,
                            text: s.text,
                            completed: s.completed,
                            taskId: id
                        }))
                    });
                }
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to update task:", error);
        return { success: false, error: String(error) };
    }
}

export async function deleteTask(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            throw new Error('Unauthorized');
        }

        const task = await prisma.task.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!task || task.user.email !== session.user.email) {
            throw new Error('Unauthorized or Task not found');
        }

        await prisma.task.delete({
            where: { id },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete task:", error);
        return { success: false, error: String(error) };
    }
}


