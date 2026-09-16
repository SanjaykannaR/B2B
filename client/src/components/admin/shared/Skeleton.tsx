import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

/**
 * Skeleton — shimmer loading placeholder.
 * Uses the .skeleton CSS class from globals.css.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  const base = 'skeleton';
  const shapes: Record<string, string> = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 rounded',
  };

  return <div className={`${base} ${shapes[variant]} ${className}`} />;
};
