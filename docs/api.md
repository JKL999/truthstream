API.md — Tool & Service API Specification

Project: Truthy – Real-Time Debate Fact Checker
Scope: Tool endpoints (called by Gemini Realtime), internal services, error model, and security.

⸻

0) Conventions
	•	Base URL (dev): https://<your-host>/api
	•	Auth: Bearer token in Authorization: Bearer <TOKEN> (server-to-server; not required for local hackathon)
	•	Content-Type: application/json; charset=utf-8
	•	Timestamps: ISO-8601 UTC (2025-10-19T20:26:33Z)
	•	IDs: snake_case strings or UUIDv4
	•	Error model:

{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable",
    "details": { "optional_struct": true }
  }
}


⸻

1) Gemini Tool Schemas (function calling)

These are the tool definitions you register when opening a Gemini Live session.

1.1 search_vectara
	•	Purpose: Query a trusted corpus (Vectara index) for primary/official citations.
	•	Input schema:

{
  "type": "object",
  "properties": {
    "query": { "type": "string", "description": "Normalized claim or targeted query" },
    "top_k": { "type": "integer", "minimum": 1, "maximum": 10, "default": 5 },
    "freshness_days": { "type": "integer", "minimum": 1, "maximum": 3660, "default": 1095 },
    "filters": {
      "type": "object",
      "properties": {
        "publisher_tier": { "type": "string", "enum": ["primary","secondary","analysis","any"], "default": "any" }
      },
      "additionalProperties": false
    }
  },
  "required": ["query"],
  "additionalProperties": false
}

	•	Output (to Gemini):

{
  "items": [
    {
      "publisher": "Chicago Police Dept.",
      "url": "https://…",
      "as_of": "2025-09-30",
      "snippet": "Violent crime YTD down 16.7% vs PY…",
      "alignment": "supports",
      "score": 0.82,
      "tier": "primary"
    }
  ]
}

1.2 search_web
	•	Purpose: Allow-listed web search with date filters (e.g., .gov, official dashboards).
	•	Input schema:

{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "top_k": { "type": "integer", "default": 5 },
    "recency_days": { "type": "integer", "default": 365 },
    "allowlist": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["query"],
  "additionalProperties": false
}

	•	Output:

{ "items": [ { "publisher":"FBI UCR", "url":"https://…", "as_of":"2024-10-15", "snippet":"…", "alignment":"supports", "score":0.77, "tier":"primary" } ] }

1.3 context_check
	•	Purpose: Sanity-check the claim’s metric/timeframe/scope (e.g., violent vs. overall crime; YTD vs. FY).
	•	Input schema:

{
  "type": "object",
  "properties": {
    "claim": { "type": "string" },
    "expected": {
      "type": "object",
      "properties": {
        "metric": { "type": "string" },
        "location": { "type": "string" },
        "timeframe": { "type": "string" }
      },
      "additionalProperties": false
    }
  },
  "required": ["claim"],
  "additionalProperties": false
}

	•	Output:

{
  "ok": true,
  "warnings": [
    "Claim uses 'violent crime' but top source is 'overall crime'."
  ],
  "notes": "Normalize to violent-crime metric before verdict."
}


⸻

2) HTTP Endpoints (Tool Router → Services)

Gemini calls your Tool Router, which calls these endpoints and returns results to Gemini via sendToolResponse.

2.1 POST /api/tools/search_vectara

Request:

{
  "query": "Violent crime in Chicago down 17% this year",
  "top_k": 5,
  "freshness_days": 1095,
  "filters": { "publisher_tier": "primary" }
}

Response 200:

{
  "items": [
    { "publisher": "Chicago PD", "url": "https://…", "as_of": "2025-09-30",
      "snippet": "Violent crime YTD down 16.7% vs PY…",
      "alignment": "supports", "score": 0.82, "tier": "primary" }
  ]
}

Response 4xx/5xx: Error model.

2.2 POST /api/tools/search_web

Request:

{
  "query": "Chicago violent crime YTD 2025 site:cityofchicago.org",
  "top_k": 5,
  "recency_days": 365,
  "allowlist": [".gov",".edu",".org","chicago.gov","fbi.gov"]
}

Response 200: same items[] shape as above.

2.3 POST /api/tools/context_check

Request:

{
  "claim": "Violent crime in Chicago dropped 17% this year",
  "expected": { "metric":"violent crime", "location":"Chicago", "timeframe":"YTD current year" }
}

Response 200: {"ok":true, "warnings":[…], "notes":"…"}

⸻

3) Internal Service APIs (optional)

3.1 POST /api/events/ingest
	•	Purpose: Persist transcripts, claims, verdicts.
	•	Request:

{
  "session_id":"sess_123",
  "type":"verdict|claim|transcript",
  "payload":{ "...": "..." }
}

	•	Response 202: { "queued": true }

3.2 GET /api/sessions/:id/summary
	•	Purpose: Post-debate report aggregation.
	•	Response 200:

{
  "session_id":"sess_123",
  "claims": 14,
  "verdicts": { "True": 3, "Mostly True": 4, "Mixed": 2, "False": 1, "Unverifiable": 4 },
  "top_sources": [ {"publisher":"FBI UCR", "count":3}, {"publisher":"Chicago PD", "count":2} ]
}


⸻

4) Security & Rate Limits
	•	Allowlist calls to search_web. Reject domains not on allowlist when enforce=true is set (env flag).
	•	Rate limit (IP or session): 60 req/min per tool endpoint (Burst 10).
	•	Logging: redact query when configured (privacy mode).

⸻

5) Validation & Error Codes
	•	INVALID_ARGUMENT — bad schema (422)
	•	RATE_LIMITED — throttled (429)
	•	BACKEND_UNAVAILABLE — dependent service failure (503)
	•	TIMEOUT — upstream exceeded 4s (504)
	•	NOT_AUTHORIZED — missing/invalid token (401)

⸻

6) Example cURL

curl -X POST https://localhost:3000/api/tools/search_vectara \
  -H 'Authorization: Bearer DEVTOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"query":"US CPI 2024 YoY", "top_k":3}'
