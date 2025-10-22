# Audio Processing Migration Guide

**Status:** Documentation for BUG-009
**Created:** 2025-10-22
**Priority:** Medium (Will become High when browsers remove support)

---

## Overview

This document outlines the migration path from the deprecated `ScriptProcessorNode` to the modern `AudioWorkletNode` API for real-time audio processing in the Truthy application.

## Why ScriptProcessorNode is Deprecated

### Technical Reasons

1. **Main Thread Execution**: ScriptProcessorNode runs on the main JavaScript thread, which can:
   - Cause audio glitches under heavy CPU load
   - Block UI rendering and user interactions
   - Create unpredictable latency in audio processing

2. **Performance Issues**:
   - Competes with rendering, event handling, and other JavaScript execution
   - Can cause frame drops and jank in the UI
   - Not suitable for production applications with consistent audio quality requirements

3. **Browser Support Timeline**:
   - Officially deprecated in Web Audio API specification
   - Browsers display deprecation warnings in console
   - May be removed in future browser versions
   - Modern web applications should use AudioWorkletNode

### Current Impact on Truthy

- Console warnings appear when recording starts
- Potential audio quality issues during heavy computational loads
- Risk of future browser incompatibility

---

## Migration Path: AudioWorkletNode

### What is AudioWorkletNode?

AudioWorkletNode is the modern replacement that:
- Runs in a separate high-priority audio thread (Worklet scope)
- Provides consistent, glitch-free audio processing
- Enables better performance and lower latency
- Is the recommended Web Audio API standard

### Architecture Comparison

#### Current (ScriptProcessorNode)
```
Main Thread
├── UI Rendering
├── Event Handling
├── Business Logic
└── Audio Processing ← PROBLEM: Competing for CPU time
```

#### Target (AudioWorkletNode)
```
Main Thread                  Audio Worklet Thread (isolated)
├── UI Rendering
├── Event Handling           └── Audio Processing ← Dedicated high-priority thread
└── Business Logic
    └── Message passing ←→
```

---

## Implementation Steps

### Step 1: Create Audio Worklet Processor

Create a new file: `public/audio-processor.js` (or in appropriate public directory)

```javascript
// audio-processor.js
class RealtimeAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    // Handle messages from main thread if needed
    console.log('Worklet received message:', event.data);
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input && input.length > 0) {
      const channelData = input[0]; // First channel

      // Send PCM data to main thread
      // Note: channelData is Float32Array of audio samples
      this.port.postMessage({
        type: 'audiodata',
        data: channelData
      });
    }

    // Return true to keep processor alive
    return true;
  }
}

registerProcessor('realtime-audio-processor', RealtimeAudioProcessor);
```

### Step 2: Modify useDebateCore.ts

#### 2.1 Update Ref Type
```typescript
// Change from:
const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);

// To:
const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
```

#### 2.2 Load Worklet Module (in startRecording)
```typescript
const startRecording = async () => {
  if (isRecording) return;

  if (!sessionARef.current || !sessionBRef.current) {
    await initSessions();
  }

  if (inputAudioContextRef.current) inputAudioContextRef.current.resume();

  updateStatus('Requesting microphone access...');
  sessionStartTimeRef.current = Date.now();

  try {
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    updateStatus('Microphone access granted. Recording...');

    if (inputAudioContextRef.current && inputNodeRef.current) {
      sourceNodeRef.current = inputAudioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current
      );
      sourceNodeRef.current.connect(inputNodeRef.current);

      // Load the audio worklet module
      try {
        await inputAudioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      } catch (err) {
        console.error('Failed to load audio worklet:', err);
        throw new Error('Could not initialize audio processing');
      }

      // Create AudioWorkletNode
      audioWorkletNodeRef.current = new AudioWorkletNode(
        inputAudioContextRef.current,
        'realtime-audio-processor'
      );

      // Listen for audio data from worklet
      audioWorkletNodeRef.current.port.onmessage = (event) => {
        if (event.data.type === 'audiodata' && isRecordingRef.current) {
          const pcmData = event.data.data; // Float32Array

          // Route to active speaker session
          const activeSession = activeSpeakerRef.current === 'A'
            ? sessionARef.current
            : sessionBRef.current;
          activeSession?.sendRealtimeInput({ media: createBlob(pcmData) });
        }
      };

      // Connect audio graph
      sourceNodeRef.current.connect(audioWorkletNodeRef.current);
      audioWorkletNodeRef.current.connect(inputAudioContextRef.current.destination);

      setIsRecording(true);
      isRecordingRef.current = true;
      updateStatus(`Recording for Speaker ${activeSpeaker}...`);
    }
  } catch (err) {
    updateStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    stopRecording();
  }
};
```

#### 2.3 Update Cleanup (in stopRecording)
```typescript
const stopRecording = () => {
  if (!isRecording && !mediaStreamRef.current) return;
  setIsRecording(false);
  isRecordingRef.current = false;

  // Clean up AudioWorkletNode
  if (audioWorkletNodeRef.current && sourceNodeRef.current) {
    audioWorkletNodeRef.current.port.onmessage = null; // Clear message handler
    audioWorkletNodeRef.current.disconnect();
    sourceNodeRef.current.disconnect();
  }

  audioWorkletNodeRef.current = null;
  sourceNodeRef.current = null;

  mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
  mediaStreamRef.current = null;

  updateStatus('Recording stopped.');
};
```

---

## Testing Checklist

After implementing the migration:

- [ ] Verify audio recording starts without errors
- [ ] Confirm audio is routed to correct speaker session (A/B)
- [ ] Test speaker switching during active recording
- [ ] Check browser console for errors/warnings
- [ ] Verify no ScriptProcessorNode deprecation warnings
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test under heavy CPU load (many browser tabs, complex UI interactions)
- [ ] Verify audio quality and absence of glitches
- [ ] Test rapid start/stop recording cycles
- [ ] Confirm proper cleanup on component unmount
- [ ] Load test: Run 30+ minute debate session

---

## Browser Compatibility

### AudioWorkletNode Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome  | 66+ | Full support |
| Firefox | 76+ | Full support |
| Safari  | 14.1+ | Full support |
| Edge    | 79+ | Full support (Chromium-based) |

All major browsers supported since 2020. AudioWorkletNode is more widely supported than you might think.

### Fallback Strategy

If supporting very old browsers is required:

```typescript
const isAudioWorkletSupported = 'audioWorklet' in AudioContext.prototype;

if (isAudioWorkletSupported) {
  // Use AudioWorkletNode implementation
} else {
  console.warn('AudioWorklet not supported, falling back to ScriptProcessorNode');
  // Fall back to ScriptProcessorNode (with deprecation warning)
}
```

However, given Truthy's target audience (modern browsers for live debates), a fallback is likely unnecessary.

---

## Performance Benefits

After migration, expect:

1. **Reduced Audio Glitches**: Audio processing runs in isolated thread
2. **Better UI Responsiveness**: Main thread freed from audio processing
3. **Lower Latency**: High-priority audio thread gets better CPU scheduling
4. **Future-Proof**: Compliant with current Web Audio API standards

---

## References

- [Web Audio API - AudioWorkletNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode)
- [Enter Audio Worklet (Chrome Developers)](https://developer.chrome.com/blog/audio-worklet/)
- [Web Audio API Spec - ScriptProcessorNode Deprecation](https://www.w3.org/TR/webaudio/#ScriptProcessorNode)
- [AudioWorklet Examples](https://googlechromelabs.github.io/web-audio-samples/audio-worklet/)

---

## Migration Timeline

**Recommended Schedule:**

1. **Phase 1 (Current)**: Documentation and planning ✓
2. **Phase 2**: Implement AudioWorkletNode in development branch
3. **Phase 3**: Testing across browsers and load conditions
4. **Phase 4**: Deploy to production
5. **Phase 5**: Monitor for issues, remove old ScriptProcessorNode code

**Estimated Effort:** 4-6 hours (implementation + testing)

---

## Related Issues

- **BUG-009**: Deprecated ScriptProcessorNode Usage
- **BUG-014**: Missing ScriptProcessor cleanup (will be resolved by migration)

---

**Document Owner:** Development Team
**Last Updated:** 2025-10-22
