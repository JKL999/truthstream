# Truthstream TODO - Post-Hackathon Roadmap

Tasks to complete after the MVP hackathon demo to make Truthstream production-ready.

## Priority 1: Core Integrations

### Vectara Integration
- [ ] Set up Vectara account and create corpus
- [ ] Seed corpus with trusted sources:
  - [ ] Wikipedia featured articles
  - [ ] Government dashboards (.gov)
  - [ ] Official statistics APIs (BLS, FBI UCR, CDC, etc.)
  - [ ] Academic databases (PubMed, JSTOR open access)
- [ ] Replace mock `/api/tools/search_vectara` with real API calls
- [ ] Implement semantic search with filters (date range, publisher tier)
- [ ] Add relevance scoring and result ranking

### Fetch.ai Agents
- [ ] Create `VectaraAgent` with Fetch SDK
- [ ] Create `WebAgent` for allow-listed web search + scraping
- [ ] Create `ContextAgent` for claim normalization and validation
- [ ] Implement agent orchestration (parallel execution)
- [ ] Add agent error handling and fallbacks
- [ ] Deploy agents to Fetch testnet/mainnet

### Web Search Integration
- [ ] Integrate SerpAPI or Brave Search API
- [ ] Enforce domain allowlist (.gov, .edu, .org, major outlets)
- [ ] Extract "as of" dates from page metadata
- [ ] Scrape snippet context (1-2 sentences around match)
- [ ] Handle rate limits and caching

---

## Priority 2: Audio & Media

### Multi-Speaker Support
- [ ] Integrate LiveKit or Daily.co for WebRTC rooms
- [ ] Support 2+ simultaneous speakers with separate tracks
- [ ] Implement server-side audio routing (LiveKit subscriber)
- [ ] Add speaker diarization (pyannote.audio or Gemini's built-in)
- [ ] Display speaker labels dynamically in UI

### Audio Quality
- [ ] Add noise suppression (krisp.ai or RNNoise)
- [ ] Support Opus codec for lower bandwidth
- [ ] Add automatic gain control (AGC)
- [ ] Handle audio interruptions gracefully (reconnect logic)

---

## Priority 3: Data & Persistence

### Database
- [ ] Set up PostgreSQL (Supabase or Neon)
- [ ] Run `prisma migrate deploy` for production schema
- [ ] Implement `/lib/persistence.ts` with Prisma queries:
  - [ ] `saveTranscript()`
  - [ ] `saveClaim()`
  - [ ] `saveVerdict()`
  - [ ] `getSessionSummary()`
- [ ] Add indexes for full-text search on claims/transcripts
- [ ] Optional: pgvector for claim similarity search

### Session Management
- [ ] Create sessions on debate start
- [ ] Store session metadata (participants, duration, topic)
- [ ] Generate post-debate summary dashboard:
  - [ ] Verdict distribution (pie chart)
  - [ ] Top sources cited
  - [ ] Timeline of claims
- [ ] Export to PDF or Notion

---

## Priority 4: UI/UX Enhancements

### Debate Interface
- [ ] Add audio level meters per speaker (visual feedback)
- [ ] Show "Checking..." state while tools run
- [ ] Add claim highlighting in transcripts (bold/underline detected claims)
- [ ] Implement verdict filtering (show only "False", etc.)
- [ ] Add search/filter for transcripts

### Overlay
- [ ] Make overlay customizable (color, position, font size)
- [ ] Add animation transitions for new verdicts
- [ ] Support multiple layouts (lower-third, sidebar, corner badge)
- [ ] Real-time WebSocket updates (not just static mock)

### Mobile Responsive
- [ ] Optimize layout for mobile/tablet
- [ ] Test on iOS Safari (Web Audio quirks)
- [ ] Add touch-friendly controls

---

## Priority 5: Security & Production

### API Key Security
- [ ] **Move Gemini API key to server-side** (create `/api/gemini-proxy` route)
- [ ] Implement WebSocket proxy for Gemini Live
- [ ] Add JWT auth for tool endpoints
- [ ] Enforce CORS allowlist
- [ ] Rate limiting (60 req/min per IP)

### Input Validation
- [ ] Zod schemas for all API inputs ✓ (already done)
- [ ] Sanitize user input (XSS prevention)
- [ ] Validate Gemini responses before parsing

### Monitoring
- [ ] Add Sentry for error tracking
- [ ] Log tool call latencies (Prometheus/Grafana)
- [ ] Alert on high error rates or API quota limits

---

## Priority 6: Advanced Features

### Moderator Console
- [ ] Admin UI to approve/suppress/edit verdicts before display
- [ ] Manual override for incorrect verdicts
- [ ] Annotate claims with additional context

### Disagreement Cards
- [ ] When sources conflict, show "Mixed" verdict with both sides
- [ ] Display conflicting evidence side-by-side
- [ ] Let users explore nuances

### Claim Prioritization
- [ ] Detect high-impact claims (quantitative, policy-related)
- [ ] De-prioritize opinion statements
- [ ] Queue claims and process by priority (not just FIFO)

### Multilingual Support
- [ ] Transcribe non-English audio
- [ ] Cross-lingual evidence search (e.g., Spanish claim → English source)
- [ ] Translate verdicts for display

---

## Priority 7: Developer Experience

### SDK/API
- [ ] Expose public API for third-party integrations:
  - [ ] `POST /api/sessions/start`
  - [ ] `POST /api/sessions/:id/claim`
  - [ ] `GET /api/sessions/:id/verdicts`
- [ ] Publish npm package `@truthstream/client`
- [ ] Write integration guides (Zapier, n8n)

### Documentation
- [ ] Auto-generate API docs (Swagger/OpenAPI)
- [ ] Video tutorials (YouTube)
- [ ] Blog posts on Medium/Dev.to
- [ ] Case studies (university debates, podcasts)

### Testing
- [ ] Unit tests for tool endpoints (Vitest)
- [ ] Integration tests for Gemini sessions
- [ ] E2E tests with Playwright (simulate mic input)
- [ ] Load testing (simulate 100+ concurrent debates)

---

## Priority 8: Deployment & Scaling

### Hosting
- [ ] Deploy to Vercel (frontend + API routes)
- [ ] OR: Docker Compose (self-hosted)
- [ ] OR: Kubernetes (for scale)
- [ ] Set up CI/CD (GitHub Actions)

### CDN & Caching
- [ ] Cache tool results in Redis (5 min TTL)
- [ ] Use CDN for static assets
- [ ] Edge functions for low-latency tool calls

### Scaling
- [ ] Horizontal scaling for tool endpoints (Cloudflare Workers)
- [ ] Message queue for async tool processing (BullMQ, RabbitMQ)
- [ ] Load balancer for Gemini sessions

---

## Priority 9: Community & Open Source

### Contribution Guide
- [ ] Write CONTRIBUTING.md
- [ ] Set up issue templates (bug, feature request)
- [ ] Add Code of Conduct
- [ ] Create PR template with checklist

### Hackathon Follow-Up
- [ ] Submit to Gemini + Fetch.ai hackathon
- [ ] Record demo video (<90 sec)
- [ ] Publish to ProductHunt
- [ ] Share on Reddit (r/programming, r/civic_tech)
- [ ] Apply for grants (Gitcoin, Protocol Labs)

---

## Priority 10: Ethics & Governance

### Bias Mitigation
- [ ] Audit source allowlist for diversity (not just US .gov)
- [ ] Include international sources (UN, EU stats, etc.)
- [ ] Avoid partisan outlets (enforce neutrality)
- [ ] Red-team with adversarial claims

### Transparency
- [ ] Log all model decisions for auditability
- [ ] Publish dataset of claims + verdicts (anonymized)
- [ ] Explain verdict reasoning in plain language

### Privacy
- [ ] PII minimization (don't store speaker names)
- [ ] GDPR compliance (right to deletion)
- [ ] Consent banner ("Recording in progress")

---

## Stretch Goals

- [ ] AI-generated debate summaries (GPT-4 or Claude)
- [ ] Fact-check leaderboard (track speaker accuracy over time)
- [ ] Gamification (award badges for truthful claims)
- [ ] Integration with Zoom/Teams (live transcription plugin)
- [ ] AR glasses support (Google Glass, Meta Ray-Ban)

---

## Timeline

| Phase | Duration | Milestones |
|-------|----------|-----------|
| MVP (Hackathon) | 2-3 days | ✅ Basic UI, mock tools, Gemini integration |
| Alpha | 2-4 weeks | Vectara + Fetch agents, multi-speaker, DB |
| Beta | 4-8 weeks | Production security, moderator console, overlay |
| v1.0 | 8-12 weeks | Public API, SDK, scaling, documentation |

---

## How to Contribute

See open issues tagged `good first issue` or `help wanted`:
- [GitHub Issues](https://github.com/yourusername/truthstream/issues)

**High-impact areas**:
- Real Vectara integration
- Fetch.ai agent development
- Mobile UI improvements
- Documentation and tutorials

---

**Built with ⚖️ for informed democracies**
