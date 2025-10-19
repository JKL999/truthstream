'use client';

import { useVEggieCore } from './VEggieCore';
import { REWARD_AMOUNT } from '../utils/vechain-wallet';

export default function VEggie() {
  const { state, actions, refs } = useVEggieCore();
  const { 
    isRecording, status, error, isConnected, audioLevel, isPlaying,
    textInput, currentAnalysis, wallet, rewardStats, showRewardAnimation
  } = state;

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 flex flex-col">
      {/* Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500/20 backdrop-blur-xl border-4 border-green-400 rounded-3xl p-12 animate-bounce">
            <div className="text-center">
              <div className="text-8xl mb-4">🌱</div>
              <div className="text-4xl font-bold text-white mb-2">+{REWARD_AMOUNT} VET!</div>
              <div className="text-xl text-green-200">Eco-Warrior! 🎉</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-black/30 backdrop-blur-sm border-b border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50">
            <span className="text-2xl">🌱</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">VEggie</h1>
            <p className="text-xs text-green-300">Eco-Friendly Food Choices</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Wallet */}
          {wallet && (
            <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-green-500/30">
              <div className="text-right">
                <div className="text-xs text-green-300">VET Balance</div>
                <div className="text-lg font-bold text-white">{wallet.balance}</div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
            </div>
          )}

          {/* Daily Rewards */}
          <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-green-500/30">
            <span className="text-green-300 text-sm">Today:</span>
            <span className="text-white font-bold">{rewardStats.remaining}/{rewardStats.limit}</span>
          </div>

          {/* Connection */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            isConnected ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative">
            <video 
              ref={refs.videoRef} 
              className={`rounded-3xl border-4 shadow-2xl transition-all duration-300 ${
                isRecording 
                  ? 'w-[32rem] h-96 border-green-500/50 shadow-green-500/30' 
                  : 'w-96 h-72 border-gray-600/30 shadow-gray-500/10'
              }`}
              muted autoPlay playsInline
            />
            
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-green-500/30 border-2 border-green-400/60 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-100 text-sm font-semibold">ANALYZING</span>
              </div>
            )}

            {isRecording && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="text-white text-sm font-medium">🎤</div>
                    <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 transition-all duration-75"
                        style={{ width: `${audioLevel * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPlaying && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-emerald-500/30 border-2 border-emerald-400/60 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse" />
                <span className="text-emerald-100 text-sm font-semibold">VEggie Speaking</span>
              </div>
            )}

            {!isRecording && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-900/80 to-emerald-900/80 rounded-3xl backdrop-blur-sm">
                <div className="text-center text-green-200">
                  <div className="text-6xl mb-4">🌱</div>
                  <p className="text-lg font-medium mb-2">Start recording</p>
                  <p className="text-sm opacity-75">Show me your food!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Sidebar */}
        {currentAnalysis && (
          <div className="w-96 bg-black/30 backdrop-blur-sm border-l border-green-500/30 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Food Analysis</h3>
              <button
                onClick={() => actions.reset()}
                className="text-green-400 hover:text-white text-sm transition-colors"
              >
                Clear
              </button>
            </div>
            
            {/* Current Food */}
            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-2xl p-5 border-2 border-orange-500/40 mb-6">
              <h4 className="text-lg font-bold text-white mb-3">{currentAnalysis.recognizedFood.name}</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-orange-300 text-xs mb-1">Calories</div>
                  <div className="text-white font-bold text-xl">{currentAnalysis.nutritionalInfo.calories}</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-orange-300 text-xs mb-1">Protein</div>
                  <div className="text-white font-bold text-xl">{currentAnalysis.nutritionalInfo.protein}g</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-orange-300 text-xs mb-1">Carbs</div>
                  <div className="text-white font-bold text-xl">{currentAnalysis.nutritionalInfo.carbs}g</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="text-orange-300 text-xs mb-1">Fat</div>
                  <div className="text-white font-bold text-xl">{currentAnalysis.nutritionalInfo.fat}g</div>
                </div>
              </div>

              <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30">
                <div className="text-red-300 text-xs mb-1">Carbon Footprint</div>
                <div className="text-white font-bold text-lg">{currentAnalysis.carbonFootprint.kgCO2e} kg CO2e</div>
                <div className="text-red-200 text-xs mt-1">{currentAnalysis.carbonFootprint.description}</div>
              </div>
            </div>

            {/* Vegetarian Alternative */}
            {currentAnalysis.vegetarianAlternative && (
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-2xl p-5 border-2 border-green-500/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌱</span>
                  <h4 className="text-lg font-bold text-white">{currentAnalysis.vegetarianAlternative.foodItem.name}</h4>
                </div>
                
                <p className="text-green-200 text-sm mb-4">{currentAnalysis.vegetarianAlternative.reason}</p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-green-300 text-xs mb-1">Calories</div>
                    <div className="text-white font-bold text-xl">{currentAnalysis.vegetarianAlternative.nutritionalInfo.calories}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-green-300 text-xs mb-1">Protein</div>
                    <div className="text-white font-bold text-xl">{currentAnalysis.vegetarianAlternative.nutritionalInfo.protein}g</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-green-300 text-xs mb-1">Carbs</div>
                    <div className="text-white font-bold text-xl">{currentAnalysis.vegetarianAlternative.nutritionalInfo.carbs}g</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="text-green-300 text-xs mb-1">Fat</div>
                    <div className="text-white font-bold text-xl">{currentAnalysis.vegetarianAlternative.nutritionalInfo.fat}g</div>
                  </div>
                </div>

                <div className="bg-green-900/40 rounded-lg p-3 border border-green-500/30 mb-4">
                  <div className="text-green-300 text-xs mb-1">Carbon Footprint</div>
                  <div className="text-white font-bold text-lg">{currentAnalysis.vegetarianAlternative.carbonFootprint.kgCO2e} kg CO2e</div>
                </div>

                <div className="bg-emerald-500/20 rounded-lg p-4 border-2 border-emerald-400/50 mb-4">
                  <div className="text-center">
                    <div className="text-emerald-300 text-sm mb-1">Carbon Savings</div>
                    <div className="text-white font-bold text-3xl mb-1">
                      {currentAnalysis.vegetarianAlternative.carbonSavings.toFixed(2)} kg
                    </div>
                    <div className="text-emerald-200 text-xs">CO2e saved per serving</div>
                  </div>
                </div>

                <button
                  onClick={actions.handleAcceptVeggie}
                  disabled={rewardStats.remaining === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {rewardStats.remaining > 0 ? `Accept & Earn ${REWARD_AMOUNT} VET! 🌟` : 'Daily Limit Reached'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/30 backdrop-blur-sm border-t border-green-500/30">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={actions.reset}
            disabled={isRecording}
            className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
              <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
            </svg>
          </button>
          
          <button
            onClick={actions.startRecording}
            disabled={isRecording}
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all transform hover:scale-105 ${
              isRecording 
                ? 'bg-green-500 border-green-400 animate-pulse' 
                : 'bg-green-600/80 border-green-500 hover:bg-green-500'
            }`}
          >
            <svg viewBox="0 0 100 100" width="32px" height="32px" fill="white">
              <circle cx="50" cy="50" r="30" />
            </svg>
          </button>
          
          <button
            onClick={actions.stopRecording}
            disabled={!isRecording}
            className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <svg viewBox="0 0 100 100" width="24px" height="24px" fill="#ffffff">
              <rect x="25" y="25" width="50" height="50" rx="8" />
            </svg>
          </button>
        </div>

        {/* Text Input */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => actions.setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && actions.sendTextMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-green-500/50 focus:bg-slate-700/70 transition-all outline-none"
          />
          <button
            onClick={actions.sendTextMessage}
            disabled={!textInput.trim() || !isConnected}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
          >
            Send
          </button>
        </div>

        {/* Status */}
        <div className="min-h-[2rem]">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          {status && !error && (
            <div className="bg-slate-700/50 border border-slate-600/30 text-slate-300 px-4 py-2 rounded-lg text-sm">
              {status}
            </div>
          )}
        </div>
      </div>

      <canvas ref={refs.canvasRef} className="hidden" />
    </div>
  );
}
