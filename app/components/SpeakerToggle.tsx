/**
 * SpeakerToggle - Switch between Speaker A and Speaker B
 */

'use client';

import { Speaker } from '@/types';

interface SpeakerToggleProps {
  activeSpeaker: Speaker;
  onToggle: (speaker: Speaker) => void;
  disabled?: boolean;
}

export default function SpeakerToggle({ activeSpeaker, onToggle, disabled }: SpeakerToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-800/50 p-1 border border-gray-700">
      <button
        onClick={() => onToggle('A')}
        disabled={disabled}
        className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
          activeSpeaker === 'A'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
            : 'text-gray-400 hover:text-white disabled:opacity-50'
        } disabled:cursor-not-allowed`}
      >
        Speaker A
      </button>
      <button
        onClick={() => onToggle('B')}
        disabled={disabled}
        className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
          activeSpeaker === 'B'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
            : 'text-gray-400 hover:text-white disabled:opacity-50'
        } disabled:cursor-not-allowed`}
      >
        Speaker B
      </button>
    </div>
  );
}
