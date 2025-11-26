'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    );
}
