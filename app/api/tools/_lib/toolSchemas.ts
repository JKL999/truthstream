/**
 * Zod validation schemas for tool inputs/outputs
 */

import { z } from 'zod';

// Evidence schema
export const EvidenceSchema = z.object({
  id: z.string().optional(),
  publisher: z.string(),
  url: z.string().url(),
  as_of: z.string(),
  snippet: z.string(),
  alignment: z.enum(['supports', 'contradicts', 'neutral']),
  score: z.number().min(0).max(1),
  tier: z.enum(['primary', 'secondary', 'analysis', 'any']).optional(),
});

// search_vectara
export const SearchVectaraInputSchema = z.object({
  query: z.string(),
  top_k: z.number().int().min(1).max(10).default(5),
  freshness_days: z.number().int().min(1).max(3660).default(1095),
  filters: z.object({
    publisher_tier: z.enum(['primary', 'secondary', 'analysis', 'any']).default('any'),
  }).optional(),
});

export const SearchVectaraOutputSchema = z.object({
  items: z.array(EvidenceSchema),
});

// search_web
export const SearchWebInputSchema = z.object({
  query: z.string(),
  top_k: z.number().int().min(1).max(10).default(5),
  recency_days: z.number().int().min(1).max(3660).default(365),
  allowlist: z.array(z.string()).optional(),
});

export const SearchWebOutputSchema = z.object({
  items: z.array(EvidenceSchema),
});

// context_check
export const ContextCheckInputSchema = z.object({
  claim: z.string(),
  expected: z.object({
    metric: z.string().optional(),
    location: z.string().optional(),
    timeframe: z.string().optional(),
  }).optional(),
});

export const ContextCheckOutputSchema = z.object({
  ok: z.boolean(),
  warnings: z.array(z.string()),
  notes: z.string().optional(),
});

export type SearchVectaraInput = z.infer<typeof SearchVectaraInputSchema>;
export type SearchVectaraOutput = z.infer<typeof SearchVectaraOutputSchema>;
export type SearchWebInput = z.infer<typeof SearchWebInputSchema>;
export type SearchWebOutput = z.infer<typeof SearchWebOutputSchema>;
export type ContextCheckInput = z.infer<typeof ContextCheckInputSchema>;
export type ContextCheckOutput = z.infer<typeof ContextCheckOutputSchema>;
