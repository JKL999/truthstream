/**
 * TranscriptPanel - Display transcripts for a speaker
 */

'use client';

import { Speaker, Transcript } from '@/types';

interface TranscriptPanelProps {
  speaker: Speaker;
  transcripts: Transcript[];
  isActive: boolean;
  audioLevel: number;
}

export default function TranscriptPanel({
  speaker,
  transcripts,
  isActive,
  audioLevel,
}: TranscriptPanelProps) {
  const speakerColor = speaker === 'A' ? 'blue' : 'purple';
  const borderClass = isActive
    ? `border-${speakerColor}-500/50`
    : 'border-gray-700/30';

  const speakerTranscripts = transcripts.filter((t) => t.speaker === speaker);

  return (
    <div
      className={`flex-1 bg-gray-900/50 backdrop-blur-sm border-2 rounded-xl p-4 transition-all duration-300 ${borderClass}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isActive
                ? speaker === 'A'
                  ? 'bg-blue-500 animate-pulse'
                  : 'bg-purple-500 animate-pulse'
                : 'bg-gray-600'
            }`}
          />
          Speaker {speaker}
        </h3>
        {isActive && audioLevel > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  speaker === 'A'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-400'
                }`}
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {speakerTranscripts.length === 0 ? (
          <div className="text-gray-500 text-sm italic">No transcript yet...</div>
        ) : (
          speakerTranscripts.map((t, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">
                {new Date(t.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-white text-sm">{t.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
