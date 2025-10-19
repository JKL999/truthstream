// Core VEggie logic and hooks
import { GoogleGenAI, LiveServerMessage, Modality, Session, Type } from '@google/genai';
import { useState, useEffect, useRef } from 'react';
import { createBlob, decode, decodeAudioData } from '../utils/audio';
import { Analyser } from '../utils/analyser';
import { FoodAnalysis } from '../data/food-store';
import {
  getOrCreateDemoWallet,
  sendVETReward,
  getTodayRewardStats,
  REWARD_AMOUNT,
  DemoWallet
} from '../utils/vechain-wallet';

export function useVEggieCore() {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<FoodAnalysis | null>(null);
  const [wallet, setWallet] = useState<DemoWallet | null>(null);
  const [rewardStats, setRewardStats] = useState({ used: 0, remaining: 5, limit: 5 });
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  const clientRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const inputAnalyserRef = useRef<Analyser | null>(null);
  const outputAnalyserRef = useRef<Analyser | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const updateStatus = (msg: string) => setStatus(msg);
  const updateError = (msg: string) => setError(msg);

  const initAudio = () => {
    if (outputAudioContextRef.current) {
      nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
    }
  };

  const handleAcceptVeggie = async () => {
    if (!currentAnalysis?.vegetarianAlternative || !wallet) return;

    updateStatus('Processing your eco-friendly choice...');
    const result = await sendVETReward(wallet.address);
    
    if (result.success) {
      setShowRewardAnimation(true);
      setTimeout(() => setShowRewardAnimation(false), 3000);
      
      const updatedWallet = await getOrCreateDemoWallet();
      setWallet(updatedWallet);
      setRewardStats(getTodayRewardStats());
      
      updateStatus(`🎉 ${REWARD_AMOUNT} VET earned! Carbon saved: ${currentAnalysis.vegetarianAlternative.carbonSavings.toFixed(2)} kg CO2e`);
      
      if (sessionRef.current) {
        sessionRef.current.sendRealtimeInput({ 
          text: `I accept the vegetarian option! Please confirm my reward.` 
        });
      }
    } else {
      updateError(result.error || 'Failed to process reward');
    }
  };

  const initClient = async () => {
    initAudio();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      updateError('NEXT_PUBLIC_GEMINI_API_KEY not found');
      return;
    }

    clientRef.current = new GoogleGenAI({ apiKey });

    if (outputNodeRef.current && outputAudioContextRef.current) {
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);
    }

    initSession();
  };

  const initSession = async () => {
    if (!clientRef.current) return;

    try {
      sessionRef.current = await clientRef.current.live.connect({
        model: 'gemini-live-2.5-flash-preview',
        callbacks: {
          onopen: () => {
            updateStatus('Connected to VEggie AI');
            setIsConnected(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.setupComplete) {
              updateStatus('Ready to analyze your food! 🌱');
            }

            if (message.toolCall?.functionCalls) {
              for (const fc of message.toolCall.functionCalls) {
                let response: any = {};
                
                if (fc.name === 'show_food_analysis') {
                  const analysis = fc.args?.analysis as any;
                  if (analysis) {
                    setCurrentAnalysis({
                      recognizedFood: {
                        id: analysis.foodId || 'unknown',
                        name: analysis.foodName,
                        category: analysis.category || 'meat',
                        isVegetarian: analysis.isVegetarian || false
                      },
                      nutritionalInfo: analysis.nutritionalInfo,
                      carbonFootprint: analysis.carbonFootprint,
                      vegetarianAlternative: analysis.vegetarianAlternative ? {
                        foodItem: {
                          id: analysis.vegetarianAlternative.foodId || 'veggie',
                          name: analysis.vegetarianAlternative.name,
                          category: 'vegetarian',
                          isVegetarian: true
                        },
                        nutritionalInfo: analysis.vegetarianAlternative.nutritionalInfo,
                        carbonFootprint: analysis.vegetarianAlternative.carbonFootprint,
                        carbonSavings: analysis.vegetarianAlternative.carbonSavings,
                        reason: analysis.vegetarianAlternative.reason
                      } : undefined
                    });
                  }
                  response = { success: true, displayed: true };
                } else if (fc.name === 'clear_analysis') {
                  setCurrentAnalysis(null);
                  response = { success: true };
                }
                
                sessionRef.current?.sendToolResponse({
                  functionResponses: [{
                    id: fc.id || fc.name,
                    name: fc.name,
                    response
                  }]
                });
              }
            }
            
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
            if (audio && outputAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(audio.data!), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              if (outputNodeRef.current) source.connect(outputNodeRef.current);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              setIsPlaying(true);
              source.addEventListener('ended', () => {
                if (sourcesRef.current.size === 1) setIsPlaying(false);
              });
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => updateError(e.message),
          onclose: (e: CloseEvent) => {
            updateStatus('Disconnected: ' + e.reason);
            setIsConnected(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are VEggie, an AI for smart glasses helping people make eco-friendly food choices.

When you see food:
1. Analyze it and provide: calories, protein, carbs, fat (per 100g serving)
2. Calculate carbon footprint in kg CO2e (beef:27, lamb:24, pork:7, chicken:6, fish:5, tofu:2, beans:1)
3. For non-vegetarian items, suggest a vegetarian alternative with similar nutrition
4. Calculate carbon savings
5. Use show_food_analysis to display everything

Be enthusiastic about eco-friendly choices! Users earn VET tokens when they accept suggestions.`,
          tools: [{
            functionDeclarations: [
              {
                name: 'show_food_analysis',
                description: 'Display complete food analysis',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    analysis: {
                      type: Type.OBJECT,
                      description: 'Complete analysis data'
                    }
                  }
                }
              },
              {
                name: 'clear_analysis',
                description: 'Clear display',
                parameters: { type: Type.OBJECT, properties: {} }
              }
            ]
          }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
          },
        },
      });
    } catch (e) {
      updateError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    if (!sessionRef.current) await initSession();
    if (inputAudioContextRef.current) inputAudioContextRef.current.resume();

    updateStatus('Requesting camera and microphone access...');

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      updateStatus('Media access granted. Starting capture...');

      if (videoRef.current && mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
        await videoRef.current.play();
      }

      if (inputAudioContextRef.current && inputNodeRef.current) {
        sourceNodeRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        sourceNodeRef.current.connect(inputNodeRef.current);

        scriptProcessorNodeRef.current = inputAudioContextRef.current.createScriptProcessor(256, 1, 1);
        scriptProcessorNodeRef.current.onaudioprocess = (e: AudioProcessingEvent) => {
          if (!isRecordingRef.current) return;
          const pcmData = e.inputBuffer.getChannelData(0);
          sessionRef.current?.sendRealtimeInput({ media: createBlob(pcmData) });
        };

        const sendVideoFrame = async () => {
          if (!isRecordingRef.current || !videoRef.current || !canvasRef.current || !sessionRef.current) return;
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = 320;
            canvas.height = 240;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg', 0.7);
            sessionRef.current.sendRealtimeInput({ 
              video: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } 
            });
          }
          
          if (isRecordingRef.current) setTimeout(sendVideoFrame, 500);
        };
        
        setTimeout(sendVideoFrame, 1000);

        sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
        scriptProcessorNodeRef.current.connect(inputAudioContextRef.current.destination);

        setIsRecording(true);
        isRecordingRef.current = true;
        updateStatus('🎥 Recording... Show me your food! 🌱');
      }
    } catch (err) {
      updateStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (!isRecording && !mediaStreamRef.current) return;
    setIsRecording(false);
    isRecordingRef.current = false;

    if (scriptProcessorNodeRef.current && sourceNodeRef.current) {
      scriptProcessorNodeRef.current.disconnect();
      sourceNodeRef.current.disconnect();
    }

    scriptProcessorNodeRef.current = null;
    sourceNodeRef.current = null;

    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;

    updateStatus('Recording stopped.');
  };

  const reset = () => {
    sessionRef.current?.close();
    setCurrentAnalysis(null);
    initSession();
  };

  const sendTextMessage = () => {
    if (!textInput.trim() || !sessionRef.current) return;
    sessionRef.current.sendRealtimeInput({ text: textInput });
    setTextInput('');
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;

      const wallet = await getOrCreateDemoWallet();
      setWallet(wallet);
      setRewardStats(getTodayRewardStats());

      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioCtx({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      
      if (inputAudioContextRef.current && outputAudioContextRef.current) {
        inputNodeRef.current = inputAudioContextRef.current.createGain();
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        
        if (inputNodeRef.current && outputNodeRef.current) {
          inputAnalyserRef.current = new Analyser(inputNodeRef.current);
          outputAnalyserRef.current = new Analyser(outputNodeRef.current);
        }
      }
      
      const updateLevels = () => {
        if (inputAnalyserRef.current) {
          inputAnalyserRef.current.update();
          setAudioLevel(Math.max(...Array.from(inputAnalyserRef.current.data)) / 255);
        }
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      await initClient();
    };

    init();

    return () => {
      mounted = false;
      stopRecording();
      sessionRef.current?.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  }, []);

  return {
    state: {
      isRecording, status, error, isConnected, audioLevel, isPlaying,
      textInput, currentAnalysis, wallet, rewardStats, showRewardAnimation
    },
    actions: {
      setTextInput, startRecording, stopRecording, reset, sendTextMessage, handleAcceptVeggie
    },
    refs: { videoRef, canvasRef }
  };
}
