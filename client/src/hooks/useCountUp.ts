import { useState, useEffect } from 'react';

/**
 * useCountUp — animates a number from 0 to target over `duration` ms.
 * Returns the current interpolated value (integer).
 */
export function useCountUp(target: number, duration: number = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target || target <= 0) { setValue(0); return; }

    let start: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
