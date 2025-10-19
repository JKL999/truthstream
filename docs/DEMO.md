# Truthstream Demo Script

Step-by-step guide to demonstrating Truthstream for judges, stakeholders, or hackathon presentations.

## Prerequisites

- App running locally (`npm run dev`)
- Microphone access granted in browser
- Chrome/Edge recommended (best Web Audio support)
- Optional: OBS Studio for overlay demo

## Demo Flow (5 minutes)

### 1. Introduction (30 seconds)

**Script**:
> "Truthstream is a real-time AI fact-checker for live debates. It listens to two speakers, detects factual claims, verifies them against trusted sources, and displays color-coded verdicts—all in under 5 seconds. Let's see it in action."

**Screen**: Show the `/debate` page at rest (before recording starts)

---

### 2. Start the Debate (30 seconds)

**Actions**:
1. Click **"Start Recording"**
2. Wait for both "Speaker A" and "Speaker B" connection indicators to turn green
3. Note the speaker toggle shows "Speaker A" is active

**Script**:
> "I've started the session. We now have two independent Gemini AI sessions connected—one for Speaker A and one for Speaker B. I'll use this toggle to simulate switching between speakers."

---

### 3. Speaker A Claims (90 seconds)

**Actions**:
1. Ensure "Speaker A" is selected
2. Speak into the mic:

**Sample Claim 1**:
> "Violent crime in Chicago dropped seventeen percent this year."

**What to Show**:
- Transcript appears in **Speaker A panel** (left side)
- Within 2-3 seconds, a **Verdict Card** appears on the right:
  - Label: **"Mostly True"** (lime/green badge)
  - Confidence: **74%**
  - Rationale: "Local dashboard shows ~16.7% YTD decrease..."
  - Click **"▶ 3 sources"** to expand:
    - Chicago PD Data Portal (as of 2025-09-30)
    - FBI UCR (as of 2024-10-15)
    - etc.

**Script**:
> "The AI just transcribed my speech, identified the factual claim about violent crime, called three verification tools in parallel, and synthesized a verdict. It's 'Mostly True' because the actual number is 16.7%, not exactly 17%. Notice the 'as of' dates on each source—critical for time-sensitive data."

---

### 4. Speaker B Claims (60 seconds)

**Actions**:
1. Click the **"Speaker B"** toggle
2. Speak a contrasting or supporting claim:

**Sample Claim 2**:
> "Crime rates nationwide have increased by ten percent."

**What to Show**:
- Transcript appears in **Speaker B panel**
- New verdict card appears with a different label (e.g., "False" or "Mixed")

**Script**:
> "Now I've switched to Speaker B. The system handles both speakers independently—each has their own Gemini session. If Speaker B makes a contradictory claim, the system evaluates it separately and can show conflicting verdicts side by side."

**Note**: Mock tools may return the same data; emphasize that in production, this would query real sources.

---

### 5. Explain Verdict Colors (30 seconds)

**Actions**: Scroll through verdict cards and point to badges

**Script**:
> "Verdicts are color-coded for clarity:
> - **Green** = True
> - **Lime** = Mostly True
> - **Amber** = Mixed (sources disagree)
> - **Orange** = Mostly False
> - **Red** = False
> - **Gray** = Unverifiable (no trustworthy source found)"

---

### 6. Show OBS Overlay (60 seconds)

**Actions**:
1. Open a new tab: `http://localhost:3000/overlay`
2. Show the lower-third display with the latest verdict
3. (Optional) In OBS, demonstrate adding this as a Browser Source

**Script**:
> "For live debates or podcasts, we have an OBS overlay route. This shows only the most recent verdict in a compact lower-third format—perfect for livestreams. Moderators can integrate this into their broadcast to give viewers instant fact-checks without cluttering the screen."

---

### 7. Highlight Key Features (30 seconds)

**Actions**: Click "Reset" and show the cleared state

**Script**:
> "Key features in this MVP:
> - **Real-time**: Under 5-second latency
> - **Dual speakers**: Independent sessions for balanced debates
> - **Source transparency**: Every verdict shows 'as of' dates
> - **Open source**: Built with Next.js, TypeScript, Tailwind, and Gemini Realtime API"

---

### 8. Future Vision (30 seconds)

**Actions**: Show `/docs/TODO.md` or mention roadmap

**Script**:
> "What's next? We'll integrate real Vectara for trusted corpus search, Fetch.ai agents for autonomous verification, and add multi-speaker diarization so moderators don't need to manually toggle. Long-term, we envision an API for civic tech platforms to embed real-time fact-checking in debates, town halls, and podcasts worldwide."

---

## Demo Tips

### Best Practices
- **Use headphones** to avoid echo feedback
- **Speak clearly** with pauses between claims
- **Prepare 2-3 sample claims** ahead of time (crime stats, economic data, etc.)
- **Test mic permissions** before demo
- **Close unnecessary tabs** to avoid browser slowdowns

### Troubleshooting

| Issue | Solution |
|-------|----------|
| No mic access | Check browser permissions (chrome://settings/content/microphone) |
| Sessions won't connect | Verify `NEXT_PUBLIC_GEMINI_API_KEY` in `.env` |
| Transcripts don't appear | Ensure speaker toggle is active and mic is capturing audio |
| Verdicts missing | Check browser console for errors; mock tools might be timing out |

### Sample Claims for Demo

**True/Mostly True**:
- "The unemployment rate in the US is currently around 4%"
- "Chicago's violent crime decreased by 16% this year"

**Mixed**:
- "Inflation has doubled in the last year" (depends on metric: headline vs core)

**False**:
- "Unemployment is at 15%" (easily refuted)

**Unverifiable**:
- "Our company's secret sales increased by 20%" (no public data)

---

## Advanced Demo (10 minutes)

If time allows, show:

1. **Code Walkthrough**:
   - Open `/app/hooks/useDebateCore.ts`
   - Show how sessions are initialized with tools
   - Highlight tool call handling

2. **Tool Endpoint Mocks**:
   - Open `/app/api/tools/search_vectara/route.ts`
   - Show mock evidence data
   - Explain TODO for real integration

3. **Database Schema**:
   - Show `/prisma/schema.prisma`
   - Explain how verdicts/transcripts can be persisted

4. **Deployment**:
   - Show Vercel deployment settings
   - Mention API key security (server-side proxy for production)

---

## Post-Demo Q&A

**Common Questions**:

**Q**: How accurate is the fact-checking?
> **A**: MVP uses mock data, so accuracy depends on the quality of sources we integrate. With real Vectara and curated corpora, we target 80%+ relevance on top-3 evidence.

**Q**: Can it handle Gish gallop (rapid-fire claims)?
> **A**: Currently queues claims and processes FIFO. Future versions will prioritize high-impact claims (quantitative, policy-related) and batch similar claims.

**Q**: What about bias in sources?
> **A**: We only search allow-listed .gov, .edu, and official sources. Future: show disagreement cards when sources conflict.

**Q**: Can users dispute verdicts?
> **A**: Not yet. Roadmap includes a moderator console to approve/suppress/annotate verdicts before display.

**Q**: How much does it cost to run?
> **A**: Gemini API costs ~$0.10 per 1M tokens. A 30-min debate uses ~50k tokens ≈ $0.005. Hosting on Vercel free tier is sufficient for demos.

---

## Recording the Demo Video

For hackathon submission:

1. **Use Loom or OBS** to record screen + voiceover
2. **Target 60-90 seconds**:
   - 0:00-0:10 Title card + tagline
   - 0:10-0:30 Start session, speak claim
   - 0:30-0:50 Show verdict with sources
   - 0:50-1:00 OBS overlay
   - 1:00-1:10 Future vision
3. **Add captions** for accessibility
4. **Background music** (optional, keep low)
5. **End with CTA**: "Try it yourself at [repo link]"

---

## Summary

**Key Takeaways for Judges**:
- ✅ Real-time (< 5s latency)
- ✅ Multi-source verification
- ✅ Transparent sourcing (as-of dates)
- ✅ OBS-ready for livestreams
- ✅ Open-source, extensible

**Unique Value**: First open-source, realtime, multi-speaker fact-checker using Gemini Live.

**Impact**: Strengthens democracies by grounding debates in shared, verifiable truth.

---

**Built with ⚖️ for informed democracies**
