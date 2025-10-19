/**
 * LiveTranscriptDisplay - Real-time transcription display with chat-bubble UI
 * Shows finalized transcripts + live/current transcription being accumulated
 */

'use client';

import { Speaker, Transcript } from '@/types';
import { useEffect, useRef } from 'react';

interface LiveTranscriptDisplayProps {
  transcripts: Transcript[];
  currentTranscriptionA: string;
  currentTranscriptionB: string;
  activeSpeaker: Speaker;
  isRecording: boolean;
}

export default function LiveTranscriptDisplay({
  transcripts,
  currentTranscriptionA,
  currentTranscriptionB,
  activeSpeaker,
  isRecording,
}: LiveTranscriptDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts, currentTranscriptionA, currentTranscriptionB]);

  return (
    <div
      ref={containerRef}
      className="relative h-[70vh] overflow-y-auto px-8 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
    >
      {/* Finalized Transcripts */}
      {transcripts.map((transcript, idx) => (
        <TranscriptBubble key={idx} transcript={transcript} />
      ))}

      {/* Live/Current Transcription for Speaker A */}
      {currentTranscriptionA && (
        <TranscriptBubble
          transcript={{
            speaker: 'A',
            text: currentTranscriptionA,
            timestamp: Date.now(),
          }}
          isLive={true}
          isActive={activeSpeaker === 'A' && isRecording}
        />
      )}

      {/* Live/Current Transcription for Speaker B */}
      {currentTranscriptionB && (
        <TranscriptBubble
          transcript={{
            speaker: 'B',
            text: currentTranscriptionB,
            timestamp: Date.now(),
          }}
          isLive={true}
          isActive={activeSpeaker === 'B' && isRecording}
        />
      )}

      {/* Placeholder when empty */}
      {transcripts.length === 0 &&
        !currentTranscriptionA &&
        !currentTranscriptionB && (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-center">
              <div className="text-6xl mb-4">🎙️</div>
              <p className="text-lg">Waiting for speakers...</p>
              <p className="text-sm mt-2">
                Transcripts will appear here in real-time
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

interface TranscriptBubbleProps {
  transcript: Transcript;
  isLive?: boolean;
  isActive?: boolean;
}

function TranscriptBubble({
  transcript,
  isLive = false,
  isActive = false,
}: TranscriptBubbleProps) {
  const isA = transcript.speaker === 'A';

  return (
    <div
      className={`flex animate-fadeIn ${isA ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-lg transition-all duration-300 ${
          isA
            ? 'bg-gradient-to-br from-blue-600/90 to-blue-700/90 text-white'
            : 'bg-gradient-to-br from-purple-600/90 to-purple-700/90 text-white'
        } ${
          isLive
            ? 'ring-2 ring-offset-2 ring-offset-gray-950 ' +
              (isA ? 'ring-blue-400' : 'ring-purple-400')
            : ''
        } ${isActive ? 'animate-pulse' : ''}`}
      >
        {/* Speaker label */}
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isLive && isActive
                ? 'animate-pulse bg-white'
                : 'bg-white/70'
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider opacity-90">
            Speaker {transcript.speaker}
          </span>
          {isLive && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Live
            </span>
          )}
        </div>

        {/* Transcript text */}
        <p className="text-base leading-relaxed">{transcript.text}</p>
      </div>
    </div>
  );
}
