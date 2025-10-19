/**
 * DebugPanel - Text input for testing without microphone
 */

'use client';

import { Speaker } from '@/types';
import { useState } from 'react';

interface DebugPanelProps {
  activeSpeaker: Speaker;
  setActiveSpeaker: (speaker: Speaker) => void;
  sendTextInput: (text: string) => void;
  isConnected: boolean;
}

const EXAMPLE_CLAIMS = [
  'Violent crime in Chicago dropped 17% this year',
  'Unemployment in the US is around 4%',
  'Inflation has doubled in the last year',
  'The GDP growth rate is 3.2%',
  'Unemployment is at 15%',
];

export default function DebugPanel({
  activeSpeaker,
  setActiveSpeaker,
  sendTextInput,
  isConnected,
}: DebugPanelProps) {
  const [textInput, setTextInput] = useState('');

  const handleSend = () => {
    if (textInput.trim()) {
      sendTextInput(textInput);
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (claim: string) => {
    setTextInput(claim);
  };

  return (
    <div className="absolute bottom-6 left-6 z-10 w-96">
      <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-blue-400">🐛 DEBUG MODE</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSpeaker('A')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeSpeaker === 'A'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Speaker A
            </button>
            <button
              onClick={() => setActiveSpeaker('B')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeSpeaker === 'B'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Speaker B
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type a claim for Speaker ${activeSpeaker}...`}
            disabled={!isConnected}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!isConnected || !textInput.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-all mb-3"
        >
          Send as Speaker {activeSpeaker}
        </button>

        {/* Example Claims */}
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs font-semibold text-gray-400 mb-2">
            QUICK TEST CLAIMS:
          </div>
          <div className="space-y-1">
            {EXAMPLE_CLAIMS.map((claim, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(claim)}
                disabled={!isConnected}
                className="w-full text-left text-xs text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                "{claim}"
              </button>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-3 text-xs text-yellow-400 text-center">
            ⚠️ Sessions not connected
          </div>
        )}
      </div>
    </div>
  );
}
