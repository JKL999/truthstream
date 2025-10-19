/**
 * Overlay Page - Lower-third display for OBS Browser Source
 * Shows only the most recent verdict in a compact, OBS-friendly format
 */

'use client';

import { useEffect, useState } from 'react';
import { Verdict, VerdictLabel } from '@/types';

const VERDICT_COLORS: Record<VerdictLabel, string> = {
  'True': '#10b981',
  'Mostly True': '#84cc16',
  'Mixed': '#f59e0b',
  'Mostly False': '#f97316',
  'False': '#ef4444',
  'Unverifiable': '#6b7280',
};

export default function OverlayPage() {
  const [latestVerdict, setLatestVerdict] = useState<Verdict | null>(null);

  // TODO: In production, connect to a real-time stream (WebSocket, SSE, or polling)
  // For MVP, this is a static demo page

  useEffect(() => {
    // Mock data for demo
    const mockVerdict: Verdict = {
      speaker: 'A',
      claim: 'Violent crime in Chicago dropped 17% this year.',
      label: 'Mostly True',
      confidence: 0.74,
      rationale: 'Local dashboard shows ~16.7% YTD decrease vs prior year.',
      sources: [
        {
          name: 'Chicago PD Dashboard',
          url: 'https://data.cityofchicago.org',
          as_of: '2025-09-30',
        },
      ],
    };

    // Simulate receiving a verdict after 2 seconds
    const timer = setTimeout(() => {
      setLatestVerdict(mockVerdict);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!latestVerdict) {
    return (
      <div className="w-full h-screen bg-transparent flex items-end justify-center pb-12">
        <div className="text-white/50 text-sm">Waiting for verdicts...</div>
      </div>
    );
  }

  const color = VERDICT_COLORS[latestVerdict.label];

  return (
    <div className="w-full h-screen bg-transparent flex items-end justify-center pb-12">
      <div
        className="bg-black/80 backdrop-blur-md border-l-4 rounded-lg p-4 max-w-3xl shadow-2xl"
        style={{ borderColor: color }}
      >
        <div className="flex items-center gap-4">
          {/* Verdict Badge */}
          <div
            className="px-4 py-2 rounded-lg font-bold text-white text-sm"
            style={{ backgroundColor: color }}
          >
            {latestVerdict.label}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="text-white font-semibold text-base mb-1">
              {latestVerdict.claim}
            </div>
            <div className="text-gray-300 text-sm">{latestVerdict.rationale}</div>
            {latestVerdict.sources && latestVerdict.sources.length > 0 && (
              <div className="text-gray-400 text-xs mt-1">
                Source: {latestVerdict.sources[0].name}
              </div>
            )}
          </div>

          {/* Confidence */}
          <div className="text-right">
            <div className="text-white font-bold text-xl">
              {(latestVerdict.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-gray-400 text-xs">Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
