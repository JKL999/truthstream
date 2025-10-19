/**
 * VerdictCard - Display a fact-check verdict optimized for live audience viewing
 */

'use client';

import { Verdict, VerdictLabel } from '@/types';

interface VerdictCardProps {
  verdict: Verdict;
}

const VERDICT_STYLES: Record<
  VerdictLabel,
  { bg: string; text: string; border: string; badgeBg: string }
> = {
  True: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/50',
    badgeBg: 'bg-green-500',
  },
  'Mostly True': {
    bg: 'bg-lime-500/10',
    text: 'text-lime-400',
    border: 'border-lime-500/50',
    badgeBg: 'bg-lime-500',
  },
  Mixed: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
    badgeBg: 'bg-amber-500',
  },
  'Mostly False': {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/50',
    badgeBg: 'bg-orange-500',
  },
  False: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/50',
    badgeBg: 'bg-red-500',
  },
  Unverifiable: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/50',
    badgeBg: 'bg-gray-500',
  },
};

export default function VerdictCard({ verdict }: VerdictCardProps) {
  const style = VERDICT_STYLES[verdict.label];

  return (
    <div
      className={`${style.bg} backdrop-blur-sm border-2 ${style.border} rounded-xl p-4 transition-all hover:shadow-xl animate-fadeIn`}
    >
      {/* Verdict Badge - Large and prominent */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`${style.badgeBg} text-white px-4 py-2 rounded-lg text-base font-black uppercase tracking-wide shadow-lg`}
        >
          {verdict.label}
        </span>
        <span
          className={`flex items-center gap-1.5 text-xs ${
            verdict.speaker === 'A' ? 'text-blue-400' : 'text-purple-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              verdict.speaker === 'A' ? 'bg-blue-500' : 'bg-purple-500'
            }`}
          />
          Speaker {verdict.speaker}
        </span>
      </div>

      {/* Claim - Medium weight */}
      <div className="text-white font-semibold mb-3 text-sm leading-relaxed">
        "{verdict.claim}"
      </div>

      {/* Rationale - Front and center, good line height */}
      <div className={`${style.text} text-sm leading-relaxed mb-3 font-medium`}>
        {verdict.rationale}
      </div>

      {/* Sources - Inline, always visible */}
      {verdict.sources && verdict.sources.length > 0 && (
        <div className="pt-3 border-t border-gray-700/30">
          <div className="text-gray-400 text-xs font-semibold mb-1.5">SOURCES:</div>
          <div className="space-y-1">
            {verdict.sources.map((source, idx) => (
              <div key={idx} className="text-xs">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {source.name}
                </a>
                <span className="text-gray-500 ml-1.5">({source.as_of})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
