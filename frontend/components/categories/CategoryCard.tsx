'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { ApiCategory } from '@/lib/api/client';

interface CategoryCardProps {
  category: ApiCategory;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const CategoryCard = ({ category, selected, disabled, onClick }: CategoryCardProps) => {
  // Use larger size for sports icons that need it
  const needsLargerSize = category.icon?.includes('nba.svg') ||
                          category.icon?.includes('epl.svg') ||
                          category.icon?.includes('tennis.svg');

  const iconSize = needsLargerSize ? 67 : 40;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex items-center justify-center w-16 h-16 transition-all',
        selected ? 'opacity-100' : 'opacity-40 hover:opacity-60',
        !selected && disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
      )}
    >
      <Image
        src={category.icon || '/icons/swords.svg'}
        alt={category.name}
        width={iconSize}
        height={iconSize}
        className="object-contain"
      />
    </button>
  );
};
