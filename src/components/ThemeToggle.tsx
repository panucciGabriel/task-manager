"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { clsx } from "clsx";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 opacity-50 cursor-not-allowed">
                <span className="sr-only">Loading theme</span>
                <div className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={clsx(
                "p-2 rounded-md transition-colors duration-200",
                "hover:bg-gray-200 dark:hover:bg-gray-800",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            )}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
                <Moon className="w-5 h-5 text-gray-700" />
            )}
        </button>
    );
}
