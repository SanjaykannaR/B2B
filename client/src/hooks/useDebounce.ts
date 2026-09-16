// This file is for: Custom hook to debounce fast-changing values
// Module: Frontend Custom Hooks (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Delays updating a value until a specified time has passed since the last change.
 * Useful for delaying API calls while a user is actively typing in a search input.
 * 
 * @param value - The value to debounce (usually a search term string)
 * @param delay - The delay in milliseconds (defaults to 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}
