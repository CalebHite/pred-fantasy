'use client';

import { ScoreboardEntry } from '@/data/mock-scores';
import { formatAddress } from '@/lib/utils/format';
import clsx from 'clsx';

interface ScoreboardProps {
  participants: ScoreboardEntry[];
  currentUserId?: string; // Highlight the current user
  className?: string;
}

export const Scoreboard = ({ participants, currentUserId, className }: ScoreboardProps) => {
  // Sort by rank
  const sortedParticipants = [...participants].sort((a, b) => a.rank - b.rank);
  const maxScore = Math.max(...participants.map((p) => p.score));

  return (
    <div className={clsx('w-full bg-white rounded-2xl shadow-sm p-6', className)}>
      <h3 className="text-xl font-medium text-black mb-6">Scoreboard</h3>

      <div className="space-y-4">
        {sortedParticipants.map((participant) => {
          const isCurrentUser = participant.userId === currentUserId;
          const scorePercentage = (participant.score / maxScore) * 100;

          return (
            <div key={participant.userId} className="space-y-2">
              {/* User Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      participant.rank === 1
                        ? 'bg-amber-100 text-amber-700'
                        : participant.rank === 2
                        ? 'bg-gray-200 text-gray-700'
                        : participant.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {participant.rank}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: participant.color || '#E5E7EB',
                    }}
                  >
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.nickname}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-white"
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

                  {/* Name and Address */}
                  <div className="flex flex-col">
                    <span
                      className={clsx(
                        'text-sm font-medium',
                        isCurrentUser ? 'text-black' : 'text-gray-900'
                      )}
                    >
                      {participant.nickname}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-light text-gray-500">(You)</span>
                      )}
                    </span>
                    <span className="text-xs font-light text-gray-500">
                      {formatAddress(participant.address)}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-lg font-medium text-black">{participant.score}</span>
                  <span className="text-sm font-light text-gray-500 ml-1">pts</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${scorePercentage}%`,
                    backgroundColor: participant.color || '#9CA3AF',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
