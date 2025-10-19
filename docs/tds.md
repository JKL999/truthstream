Technical Design Specification (TDS)

Project: Truthstream – Real-Time Debate Fact Checker
Primary model: Google Gemini Realtime (Live)
Agents: Fetch.ai sub-agents (Vectara, Web, Context)
Corpus: Vectara trusted index
Transport: WebRTC (LiveKit/Daily) → Gemini Live (WebSocket)
Frontend: Next.js + TypeScript + Tailwind
Backend: Next.js API Routes (or FastAPI) + Postgres (+ optional pgvector)

⸻

1) Objectives & Non-Goals

Objectives
	•	<2–6s** end-to-end latency from spoken claim → displayed verdict.
	•	Live transcription, claim detection, evidence retrieval, verdict synthesis with citations.
	•	Two simultaneous speakers; clear attribution of claims.
	•	Open-source, easily reproducible demo.

Non-Goals (v1)
	•	Advanced diarization beyond “Speaker A/B” mapping.
	•	Fine-grained bias correction or political stance classification.
	•	Auto-moderation or content removal.

⸻

2) High-Level Architecture

flowchart LR
  subgraph Client (Browser)
    A[UI: Next.js] -- gUM/WebRTC --> M[LiveKit/Daily Room]
    A <-- WS verdicts/transcripts --> B[UI State]
  end

  subgraph Media Layer
    M -- Server Subscriptions --> SBE[Signal/Media Bridge]
  end

  subgraph Realtime Reasoning
    SBE --> G1[Gemini Live Session A]
    SBE --> G2[Gemini Live Session B]
    G1 <--tool calls/responses--> TOOLS
    G2 <--tool calls/responses--> TOOLS
  end

  subgraph Tool Orchestration
    TOOLS[Tool Router]
    TOOLS --> VAG[VectaraAgent (Fetch)]
    TOOLS --> WAG[WebAgent (Fetch)]
    TOOLS --> CAG[ContextAgent (Fetch)]
    VAG --> VEC[Vectara Index]
  end

  subgraph Persistence
    G1 --> DB[(Postgres)]
    G2 --> DB
    TOOLS --> DB
  end

Notes
	•	SBE can be the same Next.js server (API routes) that subscribes to LiveKit/Daily remote tracks and forwards PCM to Gemini sessions.
	•	One Gemini Live session per speaker simplifies mapping/attribution and reduces prompt complexity.

⸻

3) Components & Responsibilities

3.1 Frontend (Next.js)
	•	useDebateCore() hook: manages connection, records, streams audio (if needed), subscribes to verdict/transcript events.
	•	UI:
	•	Transcript pane per speaker
	•	Claims queue & verdict cards
	•	Overlay route (/overlay) for the lower-third badge (OBS browser source)

3.2 Media Layer (LiveKit/Daily)
	•	Hosts the debate room; publishes two audio tracks.
	•	Server-side subscriber (SBE) consumes Opus/PCM frames per speaker.

3.3 Realtime Reasoning (Gemini Live)
	•	Two persistent WebSocket sessions (Session A, Session B).
	•	Instructions drive: transcription → claim extraction → tool calls → verdict JSON.
	•	Emits partial transcripts and model turns (verdicts/audio).

3.4 Tool Orchestration (Tool Router)
	•	Receives Gemini function calls:
	•	search_vectara(query) → VectaraAgent (Fetch)
	•	search_web(query) → WebAgent (Fetch)
	•	context_check(claim) → ContextAgent (Fetch)
	•	Aggregates results and replies with sendToolResponse.

3.5 Agents (Fetch.ai)
	•	VectaraAgent: queries trusted index; returns aligned candidates.
	•	WebAgent: allow-listed search + page scrape; extracts as-of dates + metric names.
	•	ContextAgent: sanity checks timeframes/metrics; outputs warnings.

3.6 Persistence (Postgres)
	•	Tables: sessions, transcripts, claims, evidence, verdicts, sources, events.
	•	Optional pgvector for later similarity lookups.

⸻

4) Data Contracts (Canonical JSON)

4.1 Claim

{
  "id": "clm_482",
  "session_id": "sess_abc",
  "speaker": "A",
  "ts_ms": 73120,
  "raw_text": "Violent crime in Chicago dropped 17% this year.",
  "normalized": {
    "topic": "violent_crime",
    "place": "Chicago, IL, USA",
    "timeframe": "YTD current year",
    "quantity": {"value": 17, "unit": "percent", "direction": "decrease"}
  },
  "checkworthy": true,
  "priority": "high"
}

4.2 Evidence

{
  "id": "ev_197",
  "claim_id": "clm_482",
  "publisher": "Chicago Police Dept. dashboard",
  "url": "https://…",
  "as_of": "2025-09-30",
  "snippet": "Violent crime YTD down 16.7% vs prior year…",
  "alignment": "supports",
  "score": 0.82
}

4.3 Verdict

{
  "id": "ver_334",
  "claim_id": "clm_482",
  "label": "Mostly True",
  "confidence": 0.74,
  "rationale": "Local dashboard shows ~16.7% YTD decrease; wording aligns.",
  "sources": [
    {"name": "Chicago PD dashboard", "url": "…", "as_of": "2025-09-30"},
    {"name": "FBI UCR 2024 release", "url": "…", "as_of": "2024-10-15"}
  ]
}


⸻

5) Realtime Session: Instructions & Tool Schemas

5.1 System Instructions (per Gemini session)

You are a live fact-checking agent for a debate.

Tasks:
1) Transcribe incoming audio in near real-time.
2) Detect check-worthy factual claims (statistics, dates, quantities, comparisons, named entities).
3) For each claim, call tools to retrieve evidence:
   - search_vectara(query)
   - search_web(query)
   - context_check(claim)
4) Synthesize a verdict strictly as JSON:
   { "speaker", "claim", "label": ["True","Mostly True","Mixed","Mostly False","False","Unverifiable"],
     "confidence": 0..1, "rationale", "sources":[{"name","url","as_of"}] }

Rules:
- Prefer primary/official sources; always show data 'as_of' dates.
- Note mismatches (violent vs overall, YTD vs FY, per-capita vs absolute).
- If insufficient evidence in 8s, return "Unverifiable".
- Keep responses concise; JSON only for verdicts.

5.2 Tool Schemas

// search_vectara
{name: "search_vectara", inputSchema: {
  type: "object",
  properties: { query: { type: "string" } },
  required: ["query"]
}}

// search_web
{name: "search_web", inputSchema: {
  type: "object",
  properties: { query: { type: "string" }, recency_days:{type:"number"} },
  required: ["query"]
}}

// context_check
{name: "context_check", inputSchema: {
  type: "object",
  properties: { claim: { type: "string" } },
  required: ["claim"]
}}


⸻

6) Sequence Diagrams

6.1 Ingest → Claim → Verdict (single claim)

sequenceDiagram
  participant A as Speaker A
  participant LK as LiveKit/Daily
  participant S as Server (SBE)
  participant G as Gemini Live A
  participant T as Tool Router
  participant V as VectaraAgent
  participant W as WebAgent
  participant C as ContextAgent
  participant UI as Next.js UI

  A->>LK: Audio
  LK->>S: Remote track (Opus/PCM)
  S->>G: sendRealtimeInput(media: PCM chunks)
  G-->>UI: partial transcript (WS)
  G->>T: toolCall search_vectara(query)
  T->>V: query
  V-->>T: evidence[]
  G->>T: toolCall search_web(query)
  T->>W: query
  W-->>T: evidence[]
  G->>T: toolCall context_check(claim)
  T->>C: claim
  C-->>T: warnings/context
  T-->>G: functionResponses
  G-->>UI: verdict JSON (WS)
  UI->>User: Render verdict + sources


⸻

7) Backend Interfaces

7.1 WebSocket to Gemini Live
	•	Endpoint: wss://.../gemini-live-...:streamGenerateContent
	•	Open message: includes model, instructions, tools.
	•	Inbound: audio frames as inline media.
	•	Outbound: partial transcripts, toolCall, serverContent.modelTurn.parts (text/audio).

7.2 Tool Router (Next.js API routes)
	•	POST /api/tools/search_vectara → { items: Evidence[] }
	•	POST /api/tools/search_web → { items: Evidence[] }
	•	POST /api/tools/context_check → { warnings: string[], ok: boolean }

Allowlist for Web search (enforced server-side):
	•	.gov, official agency APIs, select .edu/.org, major outlets with corrections policy.

⸻

8) Database Schema (SQL, minimal)

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transcripts (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  speaker TEXT CHECK (speaker IN ('A','B')),
  ts_ms INT NOT NULL,
  text TEXT NOT NULL
);

CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  speaker TEXT CHECK (speaker IN ('A','B')),
  ts_ms INT NOT NULL,
  raw_text TEXT NOT NULL,
  normalized JSONB,
  checkworthy BOOLEAN DEFAULT true
);

CREATE TABLE evidence (
  id TEXT PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id),
  publisher TEXT,
  url TEXT,
  as_of DATE,
  snippet TEXT,
  alignment TEXT CHECK (alignment IN ('supports','contradicts','neutral')),
  score FLOAT
);

CREATE TABLE verdicts (
  id TEXT PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id),
  label TEXT CHECK (label IN ('True','Mostly True','Mixed','Mostly False','False','Unverifiable')),
  confidence FLOAT,
  rationale TEXT,
  sources JSONB
);


⸻

9) Error Handling & Resilience
	•	Gemini WS disconnects: exponential backoff reconnect; resume session/queue.
	•	Tool timeouts (>4s): return partial evidence, mark verdict “Unverifiable (timeout)”.
	•	Parsing failures: all verdict JSON must be wrapped in code-fence markers in prompt (or use a delimiter); fallback to regex extraction.
	•	Gish gallop: queue claims; display “Analyzing 3 claims…” and process FIFO with priority on high-impact claims (numbers, policy).

⸻

10) Security & Privacy
	•	API keys only on server; frontend uses a proxy.
	•	CORS tight to app domain.
	•	Consent banner in UI (“Recording/AI transcription enabled”).
	•	PII minimization: store only transcript and claim/evidence metadata.
	•	Source compliance: honor robots.txt and site TOS; do not scrape gated content.

⸻

11) Deployment
	•	Option A (single service Next.js):
	•	Vercel for frontend + API routes
	•	LiveKit Cloud
	•	External Fetch agents (serverless) + Vectara SaaS
	•	Postgres: Supabase or Neon
	•	Option B (OCI free tier):
	•	Docker Compose for: Next.js, Tool Router, Agents, Postgres
	•	LiveKit server docker (optional) or LiveKit Cloud

Env vars

NEXT_PUBLIC_WS_BASE= wss://...
GEMINI_API_KEY= ***
LIVEKIT_URL= ***
LIVEKIT_API_KEY= ***
LIVEKIT_API_SECRET= ***
VECTARA_API_KEY= ***
POSTGRES_URL= ***


⸻

12) Testing & Validation

Unit
	•	Tool router returns valid JSON given fixed inputs.
	•	Verdict JSON schema validation.

Integration
	•	Simulated PCM → Gemini → tool calls → verdict in < 6s p95.
	•	Vectara index returns expected docs for seeded test topics.

Manual (Demo)
	•	Golden path clip with 2–3 known claims.
	•	OBS overlay displays verdicts with source links.

Metrics
	•	Latency (audio→verdict), coverage (% claims detected), precision (hand-labeled checks), source diversity.

⸻

13) Build Plan (Hackathon-scope)

Milestone 1 (Core Realtime, ~4–6h)
	•	Wire LiveKit/Daily room (or mic input).
	•	Open two Gemini Live sessions; stream audio; render partial transcripts.

Milestone 2 (Tools & Verdicts, ~6–8h)
	•	Implement tool router + mock agents.
	•	Add instructions; handle toolCall → functionResponses.
	•	Parse verdict JSON; render verdict cards.

Milestone 3 (Trusted Corpus & Overlay, ~3–5h)
	•	Seed Vectara with a few official sources.
	•	Implement /overlay route (lower-third badge).

Milestone 4 (Polish & Video, ~2–3h)
	•	Style cards; add as-of dates; loading states.
	•	Record 60-sec demo video.

⸻

14) Pseudocode & Code Skeletons

14.1 Server: Gemini Live session (per speaker)

const session = await genai.live.connect({
  model: 'gemini-live-2.5-flash-preview',
  instructions,
  tools,
  callbacks: {
    onmessage: handleMessage, onerror: handleError, onopen: handleOpen
  }
});

// audio pipeline (16kHz PCM float32 -> Blob)
processor.onaudioprocess = (e) => {
  const pcm = e.inputBuffer.getChannelData(0);
  session.sendRealtimeInput({ media: createBlob(pcm) });
};

14.2 Tool Router handler

if (msg.toolCall?.functionCalls) {
  for (const fc of msg.toolCall.functionCalls) {
    const response =
      fc.name === 'search_vectara' ? await vectaraSearch(fc.args)
    : fc.name === 'search_web'     ? await webSearch(fc.args)
    : fc.name === 'context_check'  ? await contextCheck(fc.args)
    : { error: 'unknown tool' };

    session.sendToolResponse({ functionResponses: [{
      id: fc.id || fc.name, name: fc.name, response
    }]});
  }
}

14.3 Verdict parsing (UI)

const parts = message.serverContent?.modelTurn?.parts ?? [];
for (const p of parts) {
  if (p.text) {
    try {
      const v = JSON.parse(p.text);
      setVerdicts(prev => [...prev, v]);
    } catch { setTranscript(prev => [...prev, p.text]); }
  }
}


⸻

15) Future Enhancements
	•	Proper speaker diarization using track metadata and/or pyannote offline alignment.
	•	Moderator console (approve/hold/suppress).
	•	Disagreement cards when sources conflict (present both).
	•	Multilingual (cross-lingual evidence search).
	•	Analytics dashboard (per-event stats, precision/recall).

⸻

16) Repository Layout

/app
  /components
    Debate.tsx
    Overlay.tsx
  /hooks
    useDebateCore.ts
  /api
    /tools
      search_vectara/route.ts
      search_web/route.ts
      context_check/route.ts
    /ws
      gemini-proxy/route.ts   # optional, proxy to Gemini Live
/backend (optional)
  tool-router.ts
  agents/
    vectaraAgent.ts
    webAgent.ts
    contextAgent.ts
/db
  schema.sql
/docs
  PRD.md
  TDS.md
  API.md
  PROMPTS.md
  RUNBOOK.md
