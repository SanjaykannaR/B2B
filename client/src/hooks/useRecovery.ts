// This file is for: Custom hook to recover and track elapsed trip time
// Module: Frontend Custom Hooks (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import { useState, useEffect } from 'react';

/**
 * useRecovery Hook
 * Computes elapsed time since a recorded start timestamp. It reads a UNIX timestamp
 * from localStorage (or takes a provided timestamp), and sets up an interval to
 * continuously update the elapsed time. This provides resilience against page 
 * reloads, background tabs, and mobile app suspensions.
 * 
 * @param storageKey - The localStorage key where the start timestamp is stored
 * @param providedStartTimestamp - Optional explicit start timestamp (e.g. from API)
 * @returns The elapsed time in milliseconds
 */
export function useRecovery(storageKey: string, providedStartTimestamp?: number | null): number {
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    // Determine the start time: favor provided timestamp (from backend API), 
    // fallback to local storage recovery (for offline/immediate resilience)
    let startTime = providedStartTimestamp;

    if (!startTime) {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        startTime = parseInt(stored, 10);
      }
    }

    if (!startTime || isNaN(startTime)) {
      setElapsedMs(0);
      return;
    }

    // Function to calculate and update current elapsed time
    const updateElapsed = () => {
      const now = Date.now();
      const diff = now - startTime!;
      setElapsedMs(diff > 0 ? diff : 0);
    };

    // Immediate update
    updateElapsed();

    // Set up 1-second interval for live ticking
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [storageKey, providedStartTimestamp]);

  return elapsedMs;
}
