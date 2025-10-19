🧠 Project PRD: Truthy – Real-Time Debate Fact Checker

Overview

Truthy is a real-time AI fact-checking assistant designed for live debates, discussions, and podcasts. It uses Google Gemini’s Realtime API to transcribe speech, detect factual claims, verify them against trusted sources, and display concise verdicts with citations.

The goal is to strengthen healthy democracies by grounding public discourse in shared, verifiable truth — enabling informed dialogue and reducing misinformation during live conversations.

⸻

1. Problem Statement

Modern public debates—political, academic, or social—often devolve into opinion wars because there’s no shared factual baseline in real time.
Traditional fact-checking is slow (post-event), fragmented, or biased by perception.

We need a system that:
	•	Listens to both sides, transcribes, and identifies factual claims instantly.
	•	Checks each claim against trusted data sources.
	•	Displays neutral verdicts with citations live on-screen or in transcript view.

⸻

2. Target Users

User	Needs	Example Scenario
🧑‍💼 Debate Hosts / Moderators	Keep debates factual and fair	Moderating a university debate
🧑‍🏫 Journalists & Podcasters	Verify guests’ claims in real time	Live podcast episode
🧑‍⚖️ Public Institutions	Promote transparency and evidence-based discourse	Election debates
🧑‍💻 Developers / Researchers	Build civic-tech integrations	Integrate Truthy into civic streaming tools


⸻

3. Vision & Goals

Type	Goal
🎯 Primary	Enable real-time, transparent, verifiable debate monitoring
🧩 Secondary	Build an open-source framework others can extend
🌍 Long-term	Foster more informed, evidence-based societies

Non-goals (for v1):
	•	Sentiment analysis or emotional tone scoring
	•	Moderation or censorship of speech
	•	Legal or medical claim evaluation (excluded domains)

⸻

4. Core Features

4.1. Real-Time Transcription
	•	Uses Gemini Realtime API for low-latency ASR (speech-to-text).
	•	Diarization per speaker (Speaker A / Speaker B).
	•	Timestamps for every transcript segment.

4.2. Claim Detection
	•	Gemini identifies check-worthy factual claims (dates, statistics, named entities, comparisons, etc.).
	•	Emits claim events to trigger sub-agents.

4.3. Fact Verification Agents

Parallel tool invocations:
	1.	VectaraAgent — queries a curated trusted corpus (Wikipedia featured, Gov dashboards, official APIs).
	2.	WebAgent — limited web search across .gov, .edu, .org, or major verified outlets.
	3.	ContextAgent — validates contextual consistency (e.g., timeframe, geography, metric alignment).

Each returns a JSON evidence array with metadata:

{
  "publisher": "FBI UCR",
  "url": "https://ucr.fbi.gov/",
  "as_of": "2025-09-30",
  "snippet": "Violent crime decreased by 16.7% YTD.",
  "alignment": "supports",
  "score": 0.88
}

4.4. Verdict Synthesis
	•	Gemini aggregates sub-agent outputs and emits:

{
  "claim": "Violent crime in Chicago dropped 17% this year.",
  "verdict": "Mostly True",
  "confidence": 0.74,
  "rationale": "Local PD dashboard reports a 16.7% YTD decrease.",
  "sources": [{ "name": "Chicago PD", "url": "..." }]
}

4.5. Live Display UI
	•	Transcript panel per speaker
	•	Claim highlight + verdict badge
	•	Collapsible sources with links
	•	Optional OBS overlay mode for livestreams (e.g., political debates)

4.6. Data Persistence
	•	Store session data for auditability:
	•	Raw audio (optional)
	•	Transcripts
	•	Claims + verdicts + evidence
	•	Post-debate summary dashboard.

⸻

5. Architecture Overview

[ LiveKit / Daily Room ]
   │
   ├── Speaker A Audio → Gemini Session A
   ├── Speaker B Audio → Gemini Session B
   │
   ▼
[ Realtime Processing Layer ]
   └── Gemini Realtime API (text + tool calls)
           │
           ├── Fetch Agents
           │     ├─ VectaraAgent
           │     ├─ WebAgent
           │     └─ ContextAgent
           │
           └── Verdict Stream (JSON)
                ▼
          [ Next.js Frontend ]
                ├─ Transcript UI
                ├─ Verdict Cards
                └─ OBS Overlay


⸻

6. Technical Requirements

Component	Stack / Tool	Notes
Frontend	Next.js + TypeScript + Tailwind	Uses React hooks for Gemini session
Audio Capture	WebRTC / getUserMedia	Mono 16kHz input, Opus encoding
Streaming	Gemini Realtime API	WebSocket w/ text + media
Fact Agents	Fetch.ai agents	Parallel, asynchronous
Trusted Corpus	Vectara	Curated, allow-listed content
Storage	PostgreSQL + Prisma	Session data persistence
Hosting	Oracle Cloud (free tier) or Vercel	Based on hackathon setup
Auth	Simple API key or Google OAuth (future)	MVP = none
Deployment	Docker Compose	One container each for FE, BE, Agents


⸻

7. Data Schema (simplified)

Claim

Field	Type	Description
id	string	UUID
text	string	Detected factual claim
speaker	string	A / B
timestamp	number	ms offset
checkworthy	boolean	true if flagged

Evidence

Field	Type	Description
id	string	UUID
claim_id	string	FK to Claim
publisher	string	Source name
url	string	Citation
alignment	enum	supports / contradicts / neutral
score	float	Confidence from retrieval

Verdict

Field	Type	Description
id	string	UUID
claim_id	string	FK
label	enum	True / Mostly True / Mixed / False / Unverifiable
confidence	float	Gemini confidence
rationale	string	Summary explanation


⸻

8. User Experience Flow
	1.	Session Start
	•	Moderator clicks “Start Debate”
	•	Both debaters join via browser (LiveKit)
	2.	Realtime Processing
	•	Gemini transcribes both voices
	•	Claims detected → verified by agents
	•	Verdict cards appear live
	3.	Post Debate
	•	Transcript & claim summary available
	•	Option to export to PDF or Notion

⸻

9. Success Metrics

Metric	Target (v1)
Latency (speech → verdict)	< 5 seconds
Claim detection accuracy	> 70%
Retrieval relevance (top-3 evidence)	> 80% alignment
User satisfaction (survey)	> 4/5
Session stability	30+ mins continuous


⸻

10. Risks & Mitigations

Risk	Impact	Mitigation
Gemini latency spikes	High	Buffer + show “checking…” state
Over/under claim detection	Medium	Fine-tune prompt weighting
Source bias	High	Curate verified corpus only
Browser mic permissions	Low	Show preflight checks
WebSocket disconnect	Medium	Auto-reconnect logic
Overheating on long sessions	Low	Batch transcript saves


⸻

11. Future Roadmap

Phase	Goal	Key Additions
MVP (Hackathon)	Real-time transcription + mock fact-checks	Gemini Realtime + stub agents
Alpha	True verification agents	Fetch + Vectara
Beta	Multi-speaker, overlay UI, storage	Full deployment
v1.0	API & SDK for integrations	Developer community version


⸻

12. Open Source & Ethics
	•	Open-source under MIT license
	•	Public datasets, transparent evidence chain
	•	No partisan filtering or censorship
	•	Logging of all model decisions for auditability

⸻

13. Deliverables for Hackathon

✅ Live working demo (2 speakers + verdict cards)
✅ Short Loom/YT demo video (≤1 min)
✅ Open-source repo with MIT license
✅ README (how to run + architecture diagram)
