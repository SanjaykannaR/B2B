import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

/**
 * PageHeader — consistent header across all admin pages.
 * Title + subtitle left-aligned, action buttons right-aligned.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  secondaryAction,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {secondaryAction}
        {action}
      </div>
    </div>
  );
};
