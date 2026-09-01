import { useState, useEffect, useCallback } from 'react';
import { formatElapsedTime } from '../utils/formatters';

export function useRecovery(manifestId: string | number, initialIsRunning: boolean = false) {
  const STORAGE_KEY = `b2b_trip_timer_${manifestId}`;

  const getSavedStartTime = useCallback((): number | null => {
    if (!manifestId) return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.startTime || null;
      }
    } catch (e) {
      console.error('Failed to read timer recovery from localStorage:', e);
    }
    return null;
  }, [manifestId, STORAGE_KEY]);

  const [startTime, setStartTime] = useState<number | null>(() => getSavedStartTime());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const savedTime = getSavedStartTime();
    if (savedTime) {
      return Math.max(0, Math.floor((Date.now() - savedTime) / 1000));
    }
    return 0;
  });
  const [isRunning, setIsRunning] = useState<boolean>(() => !!getSavedStartTime() || initialIsRunning);

  useEffect(() => {
    if (!manifestId || !isRunning) return;

    let activeStartTime = startTime;

    if (!activeStartTime) {
      activeStartTime = Date.now();
      setStartTime(activeStartTime);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: activeStartTime, manifestId }));
      } catch (e) {
        console.error('Failed to save timer recovery to localStorage:', e);
      }
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - (activeStartTime as number)) / 1000));
      setElapsedSeconds(diff);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [manifestId, isRunning, startTime, STORAGE_KEY]);

  useEffect(() => {
    const saved = getSavedStartTime();
    if (saved) {
      setStartTime(saved);
      setIsRunning(true);
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - saved) / 1000)));
    } else {
      setStartTime(null);
      setElapsedSeconds(0);
      setIsRunning(initialIsRunning);
    }
  }, [manifestId, getSavedStartTime, initialIsRunning]);

  const startTimer = useCallback(() => {
    if (!manifestId) return;
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    setElapsedSeconds(0);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: now, manifestId }));
    } catch (e) {
      console.error('Failed to start timer in localStorage:', e);
    }
  }, [manifestId, STORAGE_KEY]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const clearTimer = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedSeconds(0);
    if (manifestId) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear timer from localStorage:', e);
      }
    }
  }, [manifestId, STORAGE_KEY]);

  return {
    elapsedSeconds,
    formattedTime: formatElapsedTime(elapsedSeconds),
    isRunning,
    startTime,
    isRecovered: !!startTime,
    startTimer,
    stopTimer,
    clearTimer,
  };
}
