'use client';

import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import Image from 'next/image';

interface CategoryIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
}

export const CategoryIconButton = ({
  icon,
  label,
  selected = false,
  disabled = false,
  className,
  ...props
}: CategoryIconButtonProps) => {
  const isEmoji = !icon.startsWith('/');

  return (
    <button
      type="button"
      className={clsx(
        'flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200',
        'border-2',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Icon Container */}
      <div
        className={clsx(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all',
          selected ? 'bg-blue-100' : 'bg-gray-100'
        )}
      >
        {isEmoji ? (
          <span className="text-3xl">{icon}</span>
        ) : (
          <Image
            src={icon}
            alt={label}
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        )}
      </div>

      {/* Label */}
      <span
        className={clsx(
          'text-sm font-light text-center',
          selected ? 'text-blue-700' : 'text-gray-700'
        )}
      >
        {label}
      </span>

      {/* Selected Indicator */}
      {selected && (
        <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
};
