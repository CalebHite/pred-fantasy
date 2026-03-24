import { Participant } from '@/types';
import { Card } from '@/components/ui/Card';
import { formatAddress, formatRelativeTime } from '@/lib/utils/format';

interface ParticipantsListProps {
  participants: Participant[];
  hostAddress: string;
}

export function ParticipantsList({ participants, hostAddress }: ParticipantsListProps) {
  return (
    <Card padding="lg">
      <h3 className="text-lg font-semibold mb-4">
        Participants ({participants.length})
      </h3>

      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.address}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {participant.nickname || 'Anonymous'}
                </span>
                {participant.address === hostAddress && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    Host
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 font-mono">
                  {formatAddress(participant.address)}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  Joined {formatRelativeTime(participant.joinedAt)}
                </span>
              </div>
            </div>

            <div>
              {participant.hasPaid ? (
                <span className="text-green-600 text-xl">✓</span>
              ) : (
                <span className="text-amber-600 text-xs">Pending</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
