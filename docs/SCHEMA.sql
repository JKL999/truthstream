-- SQL Schema for Truthstream Database
-- PostgreSQL version
-- This mirrors the Prisma schema for reference

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE transcripts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('A', 'B')),
  ts_ms INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transcripts_session ON transcripts(session_id);

CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('A', 'B')),
  ts_ms INT NOT NULL,
  raw_text TEXT NOT NULL,
  normalized JSONB,
  checkworthy BOOLEAN DEFAULT true,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_claims_session ON claims(session_id);

CREATE TABLE evidence (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  as_of TEXT NOT NULL,
  snippet TEXT NOT NULL,
  alignment TEXT NOT NULL CHECK (alignment IN ('supports', 'contradicts', 'neutral')),
  score FLOAT NOT NULL CHECK (score >= 0 AND score <= 1),
  tier TEXT CHECK (tier IN ('primary', 'secondary', 'analysis', 'any')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_evidence_claim ON evidence(claim_id);

CREATE TABLE verdicts (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (label IN ('True', 'Mostly True', 'Mixed', 'Mostly False', 'False', 'Unverifiable')),
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  rationale TEXT NOT NULL,
  sources JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_verdicts_claim ON verdicts(claim_id);
CREATE INDEX idx_verdicts_session ON verdicts(session_id);

-- Optional: Full-text search on claims and transcripts
CREATE INDEX idx_claims_text_search ON claims USING gin(to_tsvector('english', raw_text));
CREATE INDEX idx_transcripts_text_search ON transcripts USING gin(to_tsvector('english', text));

-- Sample queries:

-- Get all verdicts for a session with sources
-- SELECT v.*, c.raw_text as claim_text
-- FROM verdicts v
-- JOIN claims c ON v.claim_id = c.id
-- WHERE v.session_id = 'sess_123'
-- ORDER BY v.created_at DESC;

-- Get session summary
-- SELECT
--   session_id,
--   label,
--   COUNT(*) as count
-- FROM verdicts
-- WHERE session_id = 'sess_123'
-- GROUP BY session_id, label;
