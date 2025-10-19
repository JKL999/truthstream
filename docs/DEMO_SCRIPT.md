# Truthy Demo Script: AI & Human Creativity Debate

**Debate Topic**: "Is Artificial Intelligence a Threat to Human Creativity?"

**Duration**: 5-6 minutes
**Speakers**: A (Pro-AI) vs. B (Anti-AI)
**Focus**: Quantifiable, fact-checkable claims

---

## Pre-Demo Checklist

- [ ] Start dev server: `npm run dev`
- [ ] Open `http://localhost:3000/debate`
- [ ] Grant microphone permissions
- [ ] Verify both Speaker A and B indicators are **green**
- [ ] Click **"Start Recording"** (red button)
- [ ] Test **spacebar toggle** - should switch A ↔ B
- [ ] Clear your throat and test audio levels

---

## Demo Flow

### Introduction (30 seconds)

**Say to audience**:
> "Welcome to Truthy - a real-time AI fact-checker for live debates. Watch as it listens to both speakers, detects factual claims, searches for evidence, and displays color-coded verdicts in under 5 seconds. Today's debate: Is AI a threat to human creativity? Let's see what the data says."

---

## The Debate

### 🔵 Round 1: Market Size & Adoption

**SPEAKER A** (start on A)
*Speak clearly, pause briefly between sentences*

> "AI image generation tools like Midjourney have over 15 million active users as of October 2024. This democratizes creativity - anyone can now create professional-quality art without years of training."

**Expected Verdict**: ✅ **Mostly True** (actual number varies by source, ~10-16M)

⌨️ **PRESS SPACEBAR** to switch to Speaker B

---

### 🟣 Counter-Round 1

**SPEAKER B**

> "But over 100,000 professional artists signed the Spawning petition against AI art generators in 2023. That shows massive opposition from the creative community who feel threatened."

**Expected Verdict**: ✅ **True** (well-documented petition)

⌨️ **PRESS SPACEBAR** back to Speaker A

---

### 🔵 Round 2: Economic Impact

**SPEAKER A**

> "The generative AI market reached $44 billion dollars in 2023, and it's projected to hit $110 billion by 2030. This creates new creative industries and job opportunities."

**Expected Verdict**: ✅ **Mostly True** (market size estimates vary by source)

⌨️ **PRESS SPACEBAR** to Speaker B

---

### 🟣 Counter-Round 2

**SPEAKER B**

> "Meanwhile, freelance illustration rates have dropped by 40 percent since the launch of DALL-E and Midjourney in 2022. Real artists are losing income."

**Expected Verdict**: ⚠️ **Mixed** or **Unverifiable** (anecdotal, hard to measure precisely)

⌨️ **PRESS SPACEBAR** to Speaker A

---

### 🔵 Round 3: Professional Adoption

**SPEAKER A**

> "A McKinsey study from 2024 found that 67 percent of creative professionals now use AI tools in their workflow. Artists are embracing these technologies as assistive tools."

**Expected Verdict**: ✅ **Mostly True** (various surveys show 60-75% adoption)

⌨️ **PRESS SPACEBAR** to Speaker B

---

### 🟣 Counter-Round 3: Copyright & Legal Issues

**SPEAKER B**

> "But there are over 3 billion dollars in copyright lawsuits filed against AI companies like Stability AI, Midjourney, and OpenAI as of 2024. Artists are fighting back legally."

**Expected Verdict**: ✅ **Mostly True** (multiple high-value lawsuits, total damages claimed varies)

⌨️ **PRESS SPACEBAR** to Speaker A

---

### 🔵 Round 4: Job Impact

**SPEAKER A**

> "According to a World Economic Forum report, AI will create 97 million new jobs by 2025, many of them in creative and tech sectors."

**Expected Verdict**: ✅ **True** (widely cited WEF statistic)

⌨️ **PRESS SPACEBAR** to Speaker B

---

### 🟣 Counter-Round 4: Job Displacement

**SPEAKER B**

> "That same report says AI will displace 85 million jobs by 2025. And a Bloomberg study shows that AI has already replaced 30 percent of entry-level graphic design positions since 2022."

**Expected Verdict**:
- First claim: ✅ **True** (WEF stat)
- Second claim: ⚠️ **Mixed** or **Unverifiable** (hard to measure precisely)

⌨️ **PRESS SPACEBAR** to Speaker A

---

### 🔵 Round 5: Quality & Originality

**SPEAKER A**

> "AI-generated artwork won first place at the Colorado State Fair fine arts competition in 2022, proving that AI can produce gallery-quality creative work."

**Expected Verdict**: ✅ **True** (famous Jason Allen incident)

⌨️ **PRESS SPACEBAR** to Speaker B

---

### 🟣 Counter-Round 5: Authenticity Concerns

**SPEAKER B**

> "But a Stanford study from 2024 found that 78 percent of people prefer human-created art when they know the source. Authenticity matters to audiences."

**Expected Verdict**: ⚠️ **Mixed** or **Mostly True** (depends on specific study cited)

⌨️ **PRESS SPACEBAR** to Speaker A

---

### 🔵 Closing Statement

**SPEAKER A**

> "ChatGPT reached 100 million users in just 2 months after launch in 2022, making it the fastest-growing consumer application in history. AI creativity tools are clearly meeting massive demand."

**Expected Verdict**: ✅ **True** (well-documented milestone)

---

## Demo Conclusion (30 seconds)

**Stop recording** (click stop button)

**Say to audience**:
> "As you can see, Truthy fact-checked claims from both speakers in real-time, showing you the evidence, sources, and confidence levels. Notice the variety of verdicts - from 'True' to 'Mixed' - demonstrating nuanced fact-checking. The right panel shows all verdicts with clickable sources and 'as-of' dates. This is perfect for live debates, podcasts, or political events where truth matters."

**Point to UI**:
- Show verdict color coding
- Expand a source to show attribution
- Demonstrate auto-scroll working
- Show transcript differentiation (blue vs purple)

---

## Backup Claims

**If verdicts don't appear quickly, use these stronger signals:**

### Alternative Pro-AI Claims
- "DALL-E 2 generated over 2 million images per day in 2023"
- "GitHub Copilot helps developers write 55% of their code as of 2024"
- "The AI writing assistant market grew 300% year-over-year in 2023"

### Alternative Anti-AI Claims
- "DeviantArt banned AI-generated art after 200,000 user complaints in 2023"
- "The EU AI Act requires watermarking of all AI-generated content as of 2024"
- "Getty Images filed a lawsuit for $1.8 billion against Stability AI in 2023"

---

## Timing Notes

- **Per speaker turn**: 15-20 seconds
- **Spacebar toggle**: 2-3 seconds
- **Wait for verdict**: 3-5 seconds (don't rush!)
- **Total debate**: 4-5 minutes
- **Wrap-up**: 30-60 seconds

---

## Troubleshooting

**If no verdicts appear:**
1. Check console for `[B] Gemini Message` - proves Speaker B fix worked
2. Look for "🔍 GROUNDING METADATA" in console - shows Google Search triggered
3. Try simpler claims with clear numbers
4. Speak slower and more clearly
5. Ensure good internet connection

**If transcripts stuck on one speaker:**
1. Verify closure bug fix is applied (activeSpeakerRef)
2. Check that you're pressing spacebar between speakers
3. Look for purple bubbles (Speaker B) - should alternate with blue (Speaker A)

---

## Success Criteria

✅ **At least 6-8 verdicts** appear
✅ **Mix of True/Mostly True/Mixed** labels shown
✅ **Both Speaker A and B** generate verdicts
✅ **Auto-scroll** keeps latest verdict visible
✅ **Transcripts** properly alternate blue/purple
✅ **Spacebar toggle** works smoothly
✅ **Sources** are clickable with dates

---

## Post-Demo Q&A Prep

**Q**: How accurate is the fact-checking?
**A**: It depends on Google Search results and our prompt engineering. We've tuned it for quantitative claims where ground truth is easier to verify.

**Q**: Can it handle opinion-based claims?
**A**: It's optimized for factual, quantifiable claims. Subjective statements get marked "Unverifiable" or don't trigger verdicts.

**Q**: What happens if sources conflict?
**A**: The system labels it "Mixed" and shows both perspectives in the rationale.

**Q**: Why Gemini Live instead of other models?
**A**: Gemini 2.0 Flash has built-in Google Search grounding, real-time audio transcription, and tool calling - perfect for live fact-checking.

---

**Built with ⚖️ for informed democracies**
