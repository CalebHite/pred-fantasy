'use client';

import { formatAddress } from '@/lib/utils/format';
import clsx from 'clsx';

interface UserProfileProps {
  nickname?: string;
  address: string;
  avatarUrl?: string;
  className?: string;
  onClick?: () => void;
}

export const UserProfile = ({
  nickname,
  address,
  avatarUrl,
  className,
  onClick,
}: UserProfileProps) => {
  const displayName = nickname || 'Name';
  const formattedAddress = formatAddress(address);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 p-2 rounded-lg transition-colors',
        onClick && 'hover:bg-gray-100 cursor-pointer',
        !onClick && 'cursor-default',
        className
      )}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <svg
            className="w-6 h-6 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col items-start">
        <span className="text-sm !font-medium">{displayName}</span>
        <span className="text-xs !font-light text-gray-500">{formattedAddress}</span>
      </div>
    </button>
  );
};
