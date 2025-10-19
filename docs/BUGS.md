# Truthy - Pre-Demo Bug Tracker

**Status**: Active
**Last Updated**: 2025-10-19
**Demo Date**: Today (Sunday, October 19, 2025)
**Total Bugs**: 5
**Critical Path**: BUG-002 (30 min)

---

## Overview

This document tracks all known bugs identified before the Gemini Hackathon demo. Each bug is documented with atomic structure for efficient parallel fixing using git worktrees and subagents.

---

## BUG-001: Spacebar Hotkey for Speaker Toggle

### Metadata
- **ID**: BUG-001
- **Title**: Add Spacebar Hotkey for Quick Speaker Toggle
- **Severity**: Medium
- **Status**: Open
- **Assignee**: Agent 1 (Subagent)
- **Worktree**: `../truthy-bug001`
- **Branch**: `fix/bug001-spacebar-hotkey`
- **Estimated Time**: 15 minutes

### Description
Users currently must click the Speaker A/B button to switch between speakers. During a live debate, this is cumbersome and slows down the workflow. A keyboard shortcut (spacebar) would allow instant toggling.

### Impact
- **User Experience**: Moderate - slows down speaker switching during demos
- **Demo Risk**: Low - workaround exists (clicking works)
- **Accessibility**: Medium - keyboard shortcuts improve usability

### Related Files
```
app/debate/page.tsx           # Lines 14-196 (main debate component)
app/components/SpeakerToggle.tsx  # Lines 1-43 (toggle UI component)
app/hooks/useDebateCore.ts    # Lines 450-455 (setActiveSpeaker action)
```

### Root Cause
No keyboard event listener is currently implemented for speaker toggling. The UI only supports mouse clicks on the toggle buttons.

### Proposed Solution

**Step 1**: Add global keyboard event listener in `app/debate/page.tsx`

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Only toggle if:
    // 1. Spacebar pressed
    // 2. Recording is active
    // 3. Not typing in an input field
    if (
      e.code === 'Space' &&
      isRecording &&
      !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    ) {
      e.preventDefault();
      const newSpeaker = activeSpeaker === 'A' ? 'B' : 'A';
      actions.setActiveSpeaker(newSpeaker);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isRecording, activeSpeaker, actions]);
```

**Step 2**: Add visual indicator (optional)
- Show "Press Spacebar to toggle" hint in UI
- Flash animation on spacebar press

### Testing Notes
1. Start recording
2. Press spacebar - should toggle Speaker A ↔ B
3. Verify toggle only works when `isRecording === true`
4. Verify spacebar doesn't trigger when typing in debug input
5. Check that status message updates correctly

### Dependencies
None - isolated change

---

## BUG-002: Speaker Differentiation Failure in Transcript

### Metadata
- **ID**: BUG-002
- **Title**: Transcripts Not Switching Between Speakers Correctly
- **Severity**: Critical
- **Status**: Open
- **Assignee**: Agent 2 (Subagent)
- **Worktree**: `../truthy-bug002`
- **Branch**: `fix/bug002-speaker-differentiation`
- **Estimated Time**: 30 minutes

### Description
When using voice input and toggling between Speaker A and B, the UI fails to differentiate between speakers in the transcript display. All transcripts appear as one speaker for extended periods despite multiple toggles happening. The chat bubbles don't switch colors/alignment properly.

### Impact
- **User Experience**: High - core feature broken, confusing for viewers
- **Demo Risk**: Critical - makes the dual-speaker feature look broken
- **Accuracy**: High - defeats the purpose of two-speaker debate tracking

### Related Files
```
app/hooks/useDebateCore.ts              # Lines 116-302 (handleMessage function)
  - Lines 147-175: Input transcription handling
  - Lines 158-176: Turn completion logic
  - Lines 206-294: Text parsing and transcript creation
app/components/LiveTranscriptDisplay.tsx  # Lines 40-69 (transcript rendering)
types/index.ts                          # Lines 32-37 (Transcript type)
```

### Root Cause Analysis

**Hypothesis 1**: Turn completion timing issue
- `turnComplete` event may not fire reliably when speaker switches
- Current transcription buffer (`currentTranscriptionA/B`) might not clear properly

**Hypothesis 2**: Buffer management issue
- `textBufferARef` and `textBufferBRef` (lines 87-88) accumulate text across speaker switches
- Buffers might not be properly isolated per speaker

**Hypothesis 3**: Session routing issue
- Audio routed to correct session, but transcription events tagged with wrong speaker
- `handleMessage` receives speaker param but may not use it consistently

### Proposed Solution

**Step 1**: Add debug logging
```typescript
// In handleMessage, line 147
if (message.serverContent?.inputTranscription) {
  console.log(`[${speaker}] Transcription:`, transcriptionText);
  console.log(`[${speaker}] Active speaker:`, activeSpeaker);
  // ... existing code
}
```

**Step 2**: Verify buffer isolation
- Ensure `textBufferARef` only accumulates when `speaker === 'A'`
- Clear buffers on speaker switch

**Step 3**: Force turn completion on speaker change
```typescript
// In setActiveSpeaker
const handleSetActiveSpeaker = (speaker: Speaker) => {
  // Flush current transcription before switching
  if (speaker === 'A' && currentTranscriptionB.trim()) {
    setTranscripts(prev => [...prev, {
      speaker: 'B',
      text: currentTranscriptionB.trim(),
      timestamp: Date.now() - sessionStartTimeRef.current
    }]);
    setCurrentTranscriptionB('');
  } else if (speaker === 'B' && currentTranscriptionA.trim()) {
    setTranscripts(prev => [...prev, {
      speaker: 'A',
      text: currentTranscriptionA.trim(),
      timestamp: Date.now() - sessionStartTimeRef.current
    }]);
    setCurrentTranscriptionA('');
  }

  setActiveSpeaker(speaker);
  // ... existing code
};
```

**Step 4**: Test with live audio
- Toggle speakers mid-sentence
- Verify transcripts finalize with correct speaker tag

### Testing Notes
1. Start recording as Speaker A
2. Speak: "This is Speaker A talking about cheese."
3. Toggle to Speaker B (spacebar or click)
4. Speak: "This is Speaker B disagreeing."
5. Toggle back to Speaker A
6. Speak: "Speaker A responds."
7. **Expected**: 3 separate chat bubbles (blue, purple, blue) with correct speaker labels
8. **Current Bug**: All show as one speaker or mixed incorrectly

### Dependencies
- May benefit from BUG-001 fix (spacebar toggle) for easier testing

---

## BUG-003: Fact Checks UI Blocking Transcript

### Metadata
- **ID**: BUG-003
- **Title**: Verdict Panel Overlaps/Blocks Transcript Display
- **Severity**: High
- **Status**: Open
- **Assignee**: Agent 3 (Subagent)
- **Worktree**: `../truthy-bug003`
- **Branch**: `fix/bug003-ui-blocking`
- **Estimated Time**: 20 minutes

### Description
The Fact Checks panel (verdicts) is positioned as an absolute overlay on the right side of the screen. This blocks the right portion of the transcript area, making it hard to read transcripts from Speaker B (which align right).

### Impact
- **User Experience**: High - transcript text becomes unreadable
- **Demo Risk**: Medium - looks unprofessional, viewers can't read content
- **Responsive Design**: High - likely worse on smaller screens

### Related Files
```
app/debate/page.tsx
  - Lines 85-93: Main content container
  - Lines 164-182: Verdict panel (absolute positioning)
  - Lines 86-93: LiveTranscriptDisplay container
app/components/LiveTranscriptDisplay.tsx
  - Lines 36-39: Container with scrolling
  - Lines 103-104: TranscriptBubble positioning
```

### Root Cause
The verdict panel uses `absolute` positioning without accounting for the transcript area width:

```tsx
{/* Line 165: Verdicts (Right Side Overlay) */}
<div className="absolute top-6 right-6 z-10 w-80">
  {/* Fixed width 320px, overlays transcript area */}
</div>
```

The transcript container spans full width without right margin:
```tsx
{/* Line 86: Live Transcript Display (Center) */}
<LiveTranscriptDisplay ... />
{/* No margin-right to account for fixed verdict panel */}
```

### Proposed Solution

**Option A: Add Right Margin to Transcript (Recommended)**

```tsx
// In debate/page.tsx, line 86
<div className="relative h-[calc(100vh-80px)]">
  {/* Add right padding to prevent overlap */}
  <div className="pr-[360px]"> {/* 320px panel + 40px gap */}
    <LiveTranscriptDisplay ... />
  </div>

  {/* Verdict panel stays absolute */}
  <div className="absolute top-6 right-6 z-10 w-80">
    {/* ... verdicts ... */}
  </div>
</div>
```

**Option B: Use Grid Layout**

```tsx
<div className="grid grid-cols-[1fr_320px] gap-6 h-[calc(100vh-80px)]">
  {/* Left: Transcript */}
  <div>
    <LiveTranscriptDisplay ... />
  </div>

  {/* Right: Verdicts */}
  <div className="overflow-y-auto">
    {/* ... verdicts ... */}
  </div>
</div>
```

**Option C: Responsive Sizing**

```tsx
{/* Verdict panel shrinks on smaller screens */}
<div className="absolute top-6 right-6 z-10 w-80 xl:w-96 lg:w-80 md:w-72">
```

**Recommendation**: Use Option A for minimal code changes and consistent absolute positioning.

### Testing Notes
1. Start recording
2. Speak as Speaker A and B to generate transcripts
3. Generate multiple verdicts
4. **Check**: Speaker B bubbles (right-aligned purple) should not be covered by verdict panel
5. **Check**: Scroll transcript - no text should be hidden behind verdict panel
6. Test on different screen sizes (1920x1080, 1440x900, laptop 13")

### Dependencies
None - isolated CSS/layout change

---

## BUG-004: Missing Auto-scroll for Fact Checks

### Metadata
- **ID**: BUG-004
- **Title**: Verdict Panel Doesn't Auto-scroll to Latest Fact Check
- **Severity**: Medium
- **Status**: Open
- **Assignee**: Agent 4 (Subagent)
- **Worktree**: `../truthy-bug004`
- **Branch**: `fix/bug004-autoscroll`
- **Estimated Time**: 10 minutes

### Description
When new fact checks (verdicts) are added to the right panel, the user must manually scroll down to see the latest verdict. This defeats the purpose of real-time fact-checking in a live demo.

### Impact
- **User Experience**: Medium - viewers miss latest verdicts
- **Demo Risk**: Medium - presenter must manually scroll during demo
- **Real-time UX**: High - breaks the "live" feel

### Related Files
```
app/debate/page.tsx
  - Lines 164-182: Verdict panel container
  - Line 172: Scrollable div with verdicts
app/components/LiveTranscriptDisplay.tsx
  - Lines 26-33: **REFERENCE** - auto-scroll implementation (working example!)
```

### Root Cause
The verdict panel has `overflow-y-auto` but no scroll behavior:

```tsx
{/* Line 172 */}
<div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto ...">
  {verdicts.map((verdict, idx) => <VerdictCard key={idx} verdict={verdict} />)}
</div>
```

No `useEffect` to scroll on `verdicts` state change.

### Proposed Solution

**Step 1**: Add ref to verdict container (line 165)

```tsx
const verdictContainerRef = useRef<HTMLDivElement>(null);
```

**Step 2**: Add auto-scroll effect (copy pattern from LiveTranscriptDisplay)

```tsx
// Auto-scroll to bottom when new verdicts arrive
useEffect(() => {
  if (verdictContainerRef.current) {
    verdictContainerRef.current.scrollTop = verdictContainerRef.current.scrollHeight;
  }
}, [verdicts]);
```

**Step 3**: Attach ref to scrollable div

```tsx
<div
  ref={verdictContainerRef}
  className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto ..."
>
```

### Testing Notes
1. Start recording
2. Speak multiple claims to generate 5+ verdicts (fills the panel)
3. **Expected**: Panel auto-scrolls to show the latest verdict at bottom
4. **Check**: No manual scrolling needed
5. **Edge case**: Verify scroll still works manually if user wants to review old verdicts

### Dependencies
None - simple isolated change

---

## BUG-005: Rebrand from "Truthstream" to "Truthy"

### Metadata
- **ID**: BUG-005
- **Title**: Rename Application from "Truthstream" to "Truthy"
- **Severity**: Medium (Branding)
- **Status**: Open
- **Assignee**: Agent 5 (Subagent)
- **Worktree**: `../truthy-bug005`
- **Branch**: `fix/bug005-rebrand-truthy`
- **Estimated Time**: 10 minutes

### Description
Rebrand the entire application from "Truthstream" to "Truthy" for better branding, shorter name, and tech-savvy appeal (truthy/falsy reference).

### Impact
- **Branding**: High - affects all user-facing content
- **Demo Risk**: Low - cosmetic change, no functionality affected
- **Marketing**: High - "Truthy" is catchier and more memorable

### Related Files
```
README.md                         # All occurrences (title, body, badges)
package.json                      # "name" field, "description"
app/debate/page.tsx               # Lines 44-45 (header title + subtitle)
app/layout.tsx                    # Metadata title/description
app/overlay/page.tsx              # Header/title if exists
docs/prd.md                       # All references
docs/tds.md                       # All references
docs/ARCHITECTURE.md              # System name references
docs/DEMO.md                      # Demo script
docs/TODO.md                      # Project name
docs/api.md                       # Title/headers
docs/prompts.md                   # System instruction (if app name mentioned)
app/hooks/useDebateCore.ts        # Line 14 system instruction ("You are Truthstream")
```

### Root Cause
Original branding decision, now changing based on user preference.

### Proposed Solution

**Step 1**: Global find-replace

Use `rg` (ripgrep) to find all occurrences:
```bash
rg -i "truthstream" --files-with-matches
```

**Step 2**: Replace in code files
```bash
# Case-sensitive replacements
rg "Truthstream" -l | xargs sed -i '' 's/Truthstream/Truthy/g'
rg "truthstream" -l | xargs sed -i '' 's/truthstream/truthy/g'
rg "TRUTHSTREAM" -l | xargs sed -i '' 's/TRUTHSTREAM/TRUTHY/g'
```

**Step 3**: Manual review for context-sensitive changes

Files requiring manual check:
- `README.md` - Update URL slugs if any
- `package.json` - Update `name` field to `truthy`
- `app/hooks/useDebateCore.ts` line 14 - Update system instruction
- `docs/DEMO.md` - Update demo script narrative

**Step 4**: Update subtitle/tagline

Current:
```
"Real-Time Debate Fact Checker"
```

New (options):
- "Real-Time Debate Fact Checker" (keep same)
- "Truth at the Speed of Speech" (catchier)
- "Live Fact-Checking for Healthy Debate" (descriptive)

**Recommendation**: Keep "Real-Time Debate Fact Checker" for clarity.

### Files to Change

| File | Line(s) | Change |
|------|---------|--------|
| `README.md` | 1 | `# Truthstream` → `# Truthy` |
| `package.json` | ~3 | `"name": "truthstream"` → `"name": "truthy"` |
| `app/debate/page.tsx` | 44 | `<h1>Truthstream</h1>` → `<h1>Truthy</h1>` |
| `app/hooks/useDebateCore.ts` | 14 | `You are Truthstream` → `You are Truthy` |
| `docs/*.md` | Various | All mentions |

### Testing Notes
1. Search for remaining "Truthstream" occurrences:
   ```bash
   rg -i "truthstream"
   ```
2. Verify page title in browser tab
3. Check OBS overlay (if app name displayed)
4. Verify system instruction still works (AI responds as "Truthy")
5. Check no broken URLs or references

### Dependencies
None - cosmetic change, no code logic affected

---

## Bug Summary Table

| ID | Title | Severity | Time | Status | Assignee |
|----|-------|----------|------|--------|----------|
| BUG-001 | Spacebar Hotkey | Medium | 15 min | Open | Agent 1 |
| BUG-002 | Speaker Differentiation | Critical | 30 min | Open | Agent 2 |
| BUG-003 | UI Blocking | High | 20 min | Open | Agent 3 |
| BUG-004 | Auto-scroll | Medium | 10 min | Open | Agent 4 |
| BUG-005 | Rebrand to Truthy | Medium | 10 min | Open | Agent 5 |

**Total Estimated Time**: 85 minutes (sequential) → ~30 minutes (parallel)

---

## Execution Plan

### Phase 1: Setup (5 min)
```bash
# Ensure repo is initialized
cd /Users/timzhang/dev/gemini-hackathon/truthstream
git init
git add .
git commit -m "Pre-demo snapshot before bug fixes"

# Create worktrees
git worktree add ../truthy-bug001 -b fix/bug001-spacebar-hotkey
git worktree add ../truthy-bug002 -b fix/bug002-speaker-differentiation
git worktree add ../truthy-bug003 -b fix/bug003-ui-blocking
git worktree add ../truthy-bug004 -b fix/bug004-autoscroll
git worktree add ../truthy-bug005 -b fix/bug005-rebrand-truthy
```

### Phase 2: Parallel Fixes (30 min)
Launch 5 subagents simultaneously, each working in its own worktree.

### Phase 3: Integration (15 min)
```bash
# Merge branches back to main
git checkout main
git merge fix/bug001-spacebar-hotkey
git merge fix/bug002-speaker-differentiation
git merge fix/bug003-ui-blocking
git merge fix/bug004-autoscroll
git merge fix/bug005-rebrand-truthy

# Test
npm run dev
```

### Phase 4: Cleanup (5 min)
```bash
# Remove worktrees
git worktree remove ../truthy-bug001
git worktree remove ../truthy-bug002
git worktree remove ../truthy-bug003
git worktree remove ../truthy-bug004
git worktree remove ../truthy-bug005

# Delete remote branches (optional)
git branch -d fix/bug001-spacebar-hotkey
git branch -d fix/bug002-speaker-differentiation
git branch -d fix/bug003-ui-blocking
git branch -d fix/bug004-autoscroll
git branch -d fix/bug005-rebrand-truthy
```

---

## Success Criteria

- [ ] BUG-001: Spacebar toggles speakers during recording
- [ ] BUG-002: Transcripts correctly show speaker switches with proper colors
- [ ] BUG-003: Verdict panel doesn't block transcript view
- [ ] BUG-004: Latest fact checks auto-scroll into view
- [ ] BUG-005: All "Truthstream" references changed to "Truthy"
- [ ] All fixes merged to main branch
- [ ] Integration test passes (npm run dev works)
- [ ] Demo-ready: Can showcase all features without manual workarounds

---

**Last Updated**: 2025-10-19 (Pre-demo day)
**Next Review**: After agent completion
**Owner**: Claude Code + User (Tim Zhang)
