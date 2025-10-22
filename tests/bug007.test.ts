/**
 * BUG-007: Unbounded Arrays Memory Leak - Test Suite
 *
 * Tests the sliding window implementation for transcripts and verdicts
 * to ensure arrays don't grow beyond configured limits.
 */

import { Transcript, Verdict, Speaker, VerdictLabel } from '@/types';

// Constants from useDebateCore (should match implementation)
const MAX_TRANSCRIPTS = 500;
const MAX_VERDICTS = 100;

/**
 * Helper function to apply sliding window to transcripts
 * (mirrors the implementation in useDebateCore)
 */
function addTranscriptWithLimit(existing: Transcript[], newTranscript: Transcript): Transcript[] {
  const updated = [...existing, newTranscript];
  return updated.slice(-MAX_TRANSCRIPTS);
}

/**
 * Helper function to apply sliding window to verdicts
 * (mirrors the implementation in useDebateCore)
 */
function addVerdictWithLimit(existing: Verdict[], newVerdict: Verdict): Verdict[] {
  const updated = [...existing, newVerdict];
  return updated.slice(-MAX_VERDICTS);
}

/**
 * Helper to create mock transcript
 */
function createMockTranscript(speaker: Speaker, text: string, timestamp: number): Transcript {
  return { speaker, text, timestamp };
}

/**
 * Helper to create mock verdict
 */
function createMockVerdict(
  speaker: Speaker,
  claim: string,
  label: VerdictLabel,
  confidence: number,
  timestamp: number
): Verdict {
  return {
    speaker,
    claim,
    label,
    confidence,
    rationale: 'Test rationale',
    sources: [],
    timestamp
  };
}

describe('BUG-007: Sliding Window Memory Management', () => {
  describe('Transcript Array Limits', () => {
    test('should not exceed MAX_TRANSCRIPTS limit', () => {
      let transcripts: Transcript[] = [];

      // Add more transcripts than the limit
      for (let i = 0; i < MAX_TRANSCRIPTS + 100; i++) {
        const transcript = createMockTranscript('A', `Transcript ${i}`, i);
        transcripts = addTranscriptWithLimit(transcripts, transcript);
      }

      // Array should be capped at MAX_TRANSCRIPTS
      expect(transcripts.length).toBe(MAX_TRANSCRIPTS);
    });

    test('should remove old transcripts when limit is reached', () => {
      let transcripts: Transcript[] = [];

      // Add exactly MAX_TRANSCRIPTS items
      for (let i = 0; i < MAX_TRANSCRIPTS; i++) {
        const transcript = createMockTranscript('A', `Transcript ${i}`, i);
        transcripts = addTranscriptWithLimit(transcripts, transcript);
      }

      // First transcript should have timestamp 0
      expect(transcripts[0].timestamp).toBe(0);
      expect(transcripts[0].text).toBe('Transcript 0');

      // Add one more transcript
      const newTranscript = createMockTranscript('B', 'Transcript 500', 500);
      transcripts = addTranscriptWithLimit(transcripts, newTranscript);

      // Array should still be at MAX_TRANSCRIPTS
      expect(transcripts.length).toBe(MAX_TRANSCRIPTS);

      // First transcript should now have timestamp 1 (oldest was removed)
      expect(transcripts[0].timestamp).toBe(1);
      expect(transcripts[0].text).toBe('Transcript 1');

      // Last transcript should be the new one
      expect(transcripts[transcripts.length - 1].timestamp).toBe(500);
      expect(transcripts[transcripts.length - 1].text).toBe('Transcript 500');
    });

    test('should maintain correct order in sliding window', () => {
      let transcripts: Transcript[] = [];

      // Add transcripts with sequential timestamps
      for (let i = 0; i < MAX_TRANSCRIPTS + 50; i++) {
        const transcript = createMockTranscript(
          i % 2 === 0 ? 'A' : 'B',
          `Message ${i}`,
          i * 1000
        );
        transcripts = addTranscriptWithLimit(transcripts, transcript);
      }

      // Verify array is at limit
      expect(transcripts.length).toBe(MAX_TRANSCRIPTS);

      // Verify timestamps are sequential (oldest 50 were removed)
      expect(transcripts[0].timestamp).toBe(50 * 1000);
      expect(transcripts[transcripts.length - 1].timestamp).toBe((MAX_TRANSCRIPTS + 49) * 1000);

      // Verify order is maintained
      for (let i = 1; i < transcripts.length; i++) {
        expect(transcripts[i].timestamp).toBeGreaterThan(transcripts[i - 1].timestamp);
      }
    });
  });

  describe('Verdict Array Limits', () => {
    test('should not exceed MAX_VERDICTS limit', () => {
      let verdicts: Verdict[] = [];

      // Add more verdicts than the limit
      for (let i = 0; i < MAX_VERDICTS + 50; i++) {
        const verdict = createMockVerdict(
          'A',
          `Claim ${i}`,
          'True',
          0.9,
          i
        );
        verdicts = addVerdictWithLimit(verdicts, verdict);
      }

      // Array should be capped at MAX_VERDICTS
      expect(verdicts.length).toBe(MAX_VERDICTS);
    });

    test('should remove old verdicts when limit is reached', () => {
      let verdicts: Verdict[] = [];

      // Add exactly MAX_VERDICTS items
      for (let i = 0; i < MAX_VERDICTS; i++) {
        const verdict = createMockVerdict(
          i % 2 === 0 ? 'A' : 'B',
          `Claim ${i}`,
          'True',
          0.85,
          i * 1000
        );
        verdicts = addVerdictWithLimit(verdicts, verdict);
      }

      // First verdict should have timestamp 0
      expect(verdicts[0].timestamp).toBe(0);
      expect(verdicts[0].claim).toBe('Claim 0');

      // Add one more verdict
      const newVerdict = createMockVerdict('A', 'Claim 100', 'False', 0.95, 100000);
      verdicts = addVerdictWithLimit(verdicts, newVerdict);

      // Array should still be at MAX_VERDICTS
      expect(verdicts.length).toBe(MAX_VERDICTS);

      // First verdict should now have timestamp 1000 (oldest was removed)
      expect(verdicts[0].timestamp).toBe(1000);
      expect(verdicts[0].claim).toBe('Claim 1');

      // Last verdict should be the new one
      expect(verdicts[verdicts.length - 1].timestamp).toBe(100000);
      expect(verdicts[verdicts.length - 1].claim).toBe('Claim 100');
    });

    test('should handle mixed speakers in sliding window', () => {
      let verdicts: Verdict[] = [];

      // Add verdicts alternating between speakers
      for (let i = 0; i < MAX_VERDICTS + 20; i++) {
        const verdict = createMockVerdict(
          i % 2 === 0 ? 'A' : 'B',
          `Claim ${i}`,
          'Mixed',
          0.75,
          i
        );
        verdicts = addVerdictWithLimit(verdicts, verdict);
      }

      // Verify limit
      expect(verdicts.length).toBe(MAX_VERDICTS);

      // Verify we have both speakers in the remaining verdicts
      const speakerA = verdicts.filter(v => v.speaker === 'A');
      const speakerB = verdicts.filter(v => v.speaker === 'B');

      expect(speakerA.length).toBeGreaterThan(0);
      expect(speakerB.length).toBeGreaterThan(0);
      expect(speakerA.length + speakerB.length).toBe(MAX_VERDICTS);
    });
  });

  describe('Memory Management Edge Cases', () => {
    test('should handle single transcript addition', () => {
      const transcripts: Transcript[] = [];
      const transcript = createMockTranscript('A', 'First message', 0);
      const result = addTranscriptWithLimit(transcripts, transcript);

      expect(result.length).toBe(1);
      expect(result[0]).toBe(transcript);
    });

    test('should handle empty arrays', () => {
      const emptyTranscripts = addTranscriptWithLimit([], createMockTranscript('A', 'Test', 0));
      const emptyVerdicts = addVerdictWithLimit([], createMockVerdict('A', 'Test', 'True', 0.9, 0));

      expect(emptyTranscripts.length).toBe(1);
      expect(emptyVerdicts.length).toBe(1);
    });

    test('should not mutate original array', () => {
      const original: Transcript[] = [
        createMockTranscript('A', 'Original', 0)
      ];
      const originalLength = original.length;

      const updated = addTranscriptWithLimit(original, createMockTranscript('B', 'New', 1));

      // Original should be unchanged
      expect(original.length).toBe(originalLength);
      expect(updated.length).toBe(2);
      expect(original).not.toBe(updated);
    });
  });

  describe('Long Session Simulation', () => {
    test('should handle very long debate session without memory issues', () => {
      let transcripts: Transcript[] = [];
      let verdicts: Verdict[] = [];

      // Simulate a very long session (1000 transcripts, 200 verdicts)
      const totalTranscripts = 1000;
      const totalVerdicts = 200;

      for (let i = 0; i < totalTranscripts; i++) {
        transcripts = addTranscriptWithLimit(
          transcripts,
          createMockTranscript('A', `Transcript ${i}`, i)
        );
      }

      for (let i = 0; i < totalVerdicts; i++) {
        verdicts = addVerdictWithLimit(
          verdicts,
          createMockVerdict('A', `Claim ${i}`, 'True', 0.9, i)
        );
      }

      // Verify limits are enforced
      expect(transcripts.length).toBe(MAX_TRANSCRIPTS);
      expect(verdicts.length).toBe(MAX_VERDICTS);

      // Verify we kept the most recent items
      expect(transcripts[transcripts.length - 1].text).toBe(`Transcript ${totalTranscripts - 1}`);
      expect(verdicts[verdicts.length - 1].claim).toBe(`Claim ${totalVerdicts - 1}`);

      // Verify we removed the oldest items
      expect(transcripts[0].text).toBe(`Transcript ${totalTranscripts - MAX_TRANSCRIPTS}`);
      expect(verdicts[0].claim).toBe(`Claim ${totalVerdicts - MAX_VERDICTS}`);
    });
  });
});
