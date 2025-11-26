'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register } from '@/actions/auth';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function RegisterForm() {
    const [errorMessage, dispatch, isPending] = useActionState(register, undefined);

    return (
        <form action={dispatch} className="space-y-3">
            <div className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-800 px-6 pb-4 pt-8">
                <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                    Create an account.
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
                            htmlFor="name"
                        >
                            Name
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 dark:border-gray-700 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 dark:border-gray-700 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 dark:border-gray-700 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter password (min 6 chars)"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>
                <RegisterButton />
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    )}
                </div>
                <div className="mt-4 text-center text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </form>
    );
}

function RegisterButton() {
    const { pending } = useFormStatus();

    return (
        <button
            className="mt-4 w-full flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            aria-disabled={pending}
        >
            {pending ? <Loader2 className="animate-spin w-5 h-5" /> : <>Register <ArrowRight className="ml-auto h-5 w-5 text-gray-50" /></>}
        </button>
    );
}
