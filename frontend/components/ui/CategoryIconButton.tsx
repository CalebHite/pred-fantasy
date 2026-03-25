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

  // Make certain icons larger
  const needsLargerSize = icon.toLowerCase().includes('nba') ||
                          icon.toLowerCase().includes('epl') ||
                          icon.toLowerCase().includes('tennis');
  const iconSize = needsLargerSize ? 64 : 40;
  const iconClass = needsLargerSize ? 'w-16 h-16' : 'w-10 h-10';

  return (
    <button
      type="button"
      className={clsx(
        'flex items-center justify-center transition-all duration-200 relative',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
      disabled={disabled}
      {...props}
      title={label}
    >
      {/* Icon Container */}
      <div
        className={clsx(
          'w-16 h-16 rounded-xl flex items-center justify-center transition-all border-2',
          selected ? 'border-[#25ddf9]' : 'border-transparent'
        )}
      >
        {isEmoji ? (
          <span className="text-3xl">{icon}</span>
        ) : (
          <Image
            src={icon}
            alt={label}
            width={iconSize}
            height={iconSize}
            className={`${iconClass} object-contain`}
          />
        )}
      </div>
    </button>
  );
};
