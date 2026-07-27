import React from 'react';
import { useInView } from '../../../hooks/useInView';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * AnimatedCard — wraps content with scroll-triggered fade-in-up.
 * Uses IntersectionObserver (once) + CSS transition for smooth reveal.
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const [ref, isVisible] = useInView({ threshold: 0.08 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
