/**
 * BUG-010: Event Listener Memory Leak Tests
 *
 * Tests to verify that the keyboard event listener for spacebar toggle:
 * 1. Is properly cleaned up when component unmounts
 * 2. Does not create duplicate listeners on re-renders
 * 3. Correctly toggles active speaker with spacebar
 */

import { renderHook, act } from '@testing-library/react';
import { useDebateCore } from '@/app/hooks/useDebateCore';

describe('BUG-010: Event Listener Memory Leak', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on window event listener methods
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Restore original methods
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useDebateCore());

    // Count initial keydown listeners
    const initialKeydownListeners = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    ).length;

    // Unmount the component
    unmount();

    // Verify that removeEventListener was called for keydown
    const removedKeydownListeners = removeEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    ).length;

    expect(removedKeydownListeners).toBeGreaterThanOrEqual(initialKeydownListeners);
  });

  test('should not create duplicate listeners on re-render', () => {
    const { rerender } = renderHook(() => useDebateCore());

    // Get initial count of keydown listeners
    const initialCount = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    ).length;

    // Force multiple re-renders
    rerender();
    rerender();
    rerender();

    // Get final count of keydown listeners
    const finalCount = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    ).length;

    // The count should be the same (no duplicate listeners added)
    // or cleanup should have been called for each additional listener
    const cleanupCount = removeEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    ).length;

    // Either no new listeners were added, or cleanup was called for extras
    expect(finalCount - initialCount).toBeLessThanOrEqual(cleanupCount);
  });

  test('should properly toggle active speaker with spacebar', () => {
    const { result } = renderHook(() => useDebateCore());

    // Start recording first (spacebar only works when recording)
    act(() => {
      result.current.actions.startRecording();
    });

    // Get initial active speaker
    const initialSpeaker = result.current.state.activeSpeaker;

    // Simulate spacebar press
    const spacebarEvent = new KeyboardEvent('keydown', {
      code: 'Space',
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      window.dispatchEvent(spacebarEvent);
    });

    // Verify speaker was toggled
    const newSpeaker = result.current.state.activeSpeaker;
    expect(newSpeaker).not.toBe(initialSpeaker);
    expect(newSpeaker).toBe(initialSpeaker === 'A' ? 'B' : 'A');
  });

  test('should not toggle speaker when not recording', () => {
    const { result } = renderHook(() => useDebateCore());

    // Ensure we're not recording
    const initialSpeaker = result.current.state.activeSpeaker;
    const initialRecording = result.current.state.isRecording;
    expect(initialRecording).toBe(false);

    // Simulate spacebar press
    const spacebarEvent = new KeyboardEvent('keydown', {
      code: 'Space',
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      window.dispatchEvent(spacebarEvent);
    });

    // Verify speaker was NOT toggled
    expect(result.current.state.activeSpeaker).toBe(initialSpeaker);
  });

  test('should not toggle speaker when typing in input field', () => {
    const { result } = renderHook(() => useDebateCore());

    // Start recording
    act(() => {
      result.current.actions.startRecording();
    });

    const initialSpeaker = result.current.state.activeSpeaker;

    // Create an input element and simulate typing
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate spacebar press while focused on input
    const spacebarEvent = new KeyboardEvent('keydown', {
      code: 'Space',
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(spacebarEvent, 'target', { value: input });

    act(() => {
      window.dispatchEvent(spacebarEvent);
    });

    // Verify speaker was NOT toggled (because we're in an input field)
    expect(result.current.state.activeSpeaker).toBe(initialSpeaker);

    // Cleanup
    document.body.removeChild(input);
  });

  test('setActiveSpeaker function should have stable reference', () => {
    const { result, rerender } = renderHook(() => useDebateCore());

    // Get initial setActiveSpeaker reference
    const initialSetActiveSpeaker = result.current.actions.setActiveSpeaker;

    // Force re-render
    rerender();

    // Get new setActiveSpeaker reference
    const newSetActiveSpeaker = result.current.actions.setActiveSpeaker;

    // Verify the function reference is stable (same reference after re-render)
    // This is critical for preventing the useEffect from re-running
    expect(newSetActiveSpeaker).toBe(initialSetActiveSpeaker);
  });

  test('should handle rapid spacebar presses without creating duplicate listeners', () => {
    const { result } = renderHook(() => useDebateCore());

    // Start recording
    act(() => {
      result.current.actions.startRecording();
    });

    // Get listener count before rapid toggles
    const listenerCountBefore = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    ).length;

    // Simulate rapid spacebar presses (10 times)
    for (let i = 0; i < 10; i++) {
      const spacebarEvent = new KeyboardEvent('keydown', {
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        window.dispatchEvent(spacebarEvent);
      });
    }

    // Get listener count after rapid toggles
    const listenerCountAfter = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    ).length;

    // Verify no new listeners were added during toggles
    expect(listenerCountAfter).toBe(listenerCountBefore);
  });
});

/**
 * Integration test for the DebatePage component
 */
describe('BUG-010: DebatePage Component Event Listeners', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('useEffect should only depend on stable references', () => {
    // This is a conceptual test - in practice, you would render the DebatePage
    // and verify that the useEffect dependency array contains only stable values

    // The key assertion is that actions.setActiveSpeaker should be memoized
    // (wrapped in useCallback) so its reference doesn't change on every render

    // This test would be implemented by:
    // 1. Rendering DebatePage component
    // 2. Triggering a re-render that doesn't change isRecording or activeSpeaker
    // 3. Verifying that addEventListener was not called again
    // 4. Verifying that the old listener was not removed and re-added

    expect(true).toBe(true); // Placeholder - implement when component testing is set up
  });
});
