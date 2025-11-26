'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const RegisterSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        await signIn('credentials', { email, password });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return 'Invalid fields. Failed to register.';
    }

    const { email, password, name } = validatedFields.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return 'Email already in use.';
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        return `Error: ${error.message}`;
    }

    return "Registration successful! Please log in.";
}
