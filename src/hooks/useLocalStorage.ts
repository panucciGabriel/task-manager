"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Initialize state with a function to avoid reading localStorage during SSR
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Effect to update localStorage when state changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            } catch (error) {
                console.error(error);
            }
        }
    }, [key, storedValue]);

    // Handle hydration mismatch by ensuring we only show the stored value after mount
    // This is a simplified approach; for strict hydration matching, one might use a separate effect
    // to set the value from localStorage only on the client.
    // However, the initial state function above handles the "undefined window" case for SSR.
    // To be perfectly safe against hydration errors if the server initialValue differs from client localStorage:
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // If not mounted, return initialValue to match server HTML (if needed)
    // But for this app, we might want to show the data immediately if possible.
    // The standard way to avoid hydration mismatch is to return initialValue until mounted.

    return [isMounted ? storedValue : initialValue, setStoredValue] as const;
}
