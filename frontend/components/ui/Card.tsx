import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = ({ children, className, padding = 'md', hover = false, ...props }: CardProps) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      {...props}
      className={clsx(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        paddingStyles[padding],
        hover && 'hover:shadow-md hover:border-gray-300 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
};
