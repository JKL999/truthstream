/**
 * Debate Page - Main UI for two-speaker live debate fact-checking
 */

'use client';

import { useRef, useEffect } from 'react';
import { useDebateCore } from '@/app/hooks/useDebateCore';
import SpeakerToggle from '@/app/components/SpeakerToggle';
import LiveTranscriptDisplay from '@/app/components/LiveTranscriptDisplay';
import VerdictCard from '@/app/components/VerdictCard';
import DebugPanel from '@/app/components/DebugPanel';

export default function DebatePage() {
  const { state, actions } = useDebateCore();
  const {
    isRecording,
    isConnectedA,
    isConnectedB,
    activeSpeaker,
    transcripts,
    verdicts,
    currentTranscriptionA,
    currentTranscriptionB,
    audioLevelA,
    audioLevelB,
    isPlayingA,
    isPlayingB,
    status,
    error,
    debugMode,
  } = state;

  const verdictContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll verdicts to bottom when new ones arrive
  useEffect(() => {
    if (verdictContainerRef.current) {
      verdictContainerRef.current.scrollTop = verdictContainerRef.current.scrollHeight;
    }
  }, [verdicts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl">⚖️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Truthstream</h1>
                <p className="text-sm text-gray-400">Real-Time Debate Fact Checker</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnectedA ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                  }`}
                />
                <span className="text-gray-400">Speaker A</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnectedB ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                  }`}
                />
                <span className="text-gray-400">Speaker B</span>
              </div>

              {/* Debug Mode Toggle */}
              <button
                onClick={actions.toggleDebugMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  debugMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
                title="Toggle debug mode for text input testing"
              >
                {debugMode ? '🐛 Debug: ON' : '🐛 Debug'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Screen Transcript Display */}
      <div className="relative h-[calc(100vh-80px)]">
        {/* Live Transcript Display (Center) */}
        <LiveTranscriptDisplay
          transcripts={transcripts}
          currentTranscriptionA={currentTranscriptionA}
          currentTranscriptionB={currentTranscriptionB}
          activeSpeaker={activeSpeaker}
          isRecording={isRecording}
        />

        {/* Controls (Bottom Overlay) */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-6 pb-6">
            <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                {/* Left: Speaker Toggle */}
                <SpeakerToggle
                  activeSpeaker={activeSpeaker}
                  onToggle={actions.setActiveSpeaker}
                  disabled={!isRecording}
                />

                {/* Center: Status */}
                <div className="flex-1 mx-6">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm text-center">
                      {error}
                    </div>
                  )}
                  {status && !error && (
                    <div className="text-gray-300 px-4 py-2 text-sm text-center">
                      {status}
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={actions.reset}
                    disabled={isRecording}
                    className="p-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-full transition-all shadow-lg"
                    title="Reset"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="currentColor"
                    >
                      <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
                    </svg>
                  </button>

                  {!isRecording ? (
                    <button
                      onClick={actions.startRecording}
                      disabled={!isConnectedA || !isConnectedB}
                      className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-full transition-all shadow-lg flex items-center justify-center"
                      title="Start Recording"
                    >
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </button>
                  ) : (
                    <button
                      onClick={actions.stopRecording}
                      className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-full transition-all shadow-lg flex items-center justify-center"
                      title="Stop Recording"
                    >
                      <div className="w-5 h-5 bg-white rounded-sm"></div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verdicts (Right Side Overlay) */}
        <div className="absolute top-6 right-6 z-10 w-80">
          <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 shadow-2xl max-h-[calc(100vh-200px)]">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>🔍</span>
              Fact Checks
            </h2>

            <div
              ref={verdictContainerRef}
              className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
              {verdicts.length === 0 ? (
                <div className="text-gray-500 text-xs italic text-center py-6">
                  Verdicts will appear here as claims are detected...
                </div>
              ) : (
                verdicts.map((verdict, idx) => <VerdictCard key={idx} verdict={verdict} />)
              )}
            </div>
          </div>
        </div>

        {/* Debug Panel (Bottom Left) */}
        {debugMode && (
          <DebugPanel
            activeSpeaker={activeSpeaker}
            setActiveSpeaker={actions.setActiveSpeaker}
            sendTextInput={actions.sendTextInput}
            isConnected={isConnectedA && isConnectedB}
          />
        )}
      </div>
    </div>
  );
}
