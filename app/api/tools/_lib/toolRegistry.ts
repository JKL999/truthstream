/**
 * Tool definitions for Gemini Realtime API
 * These are registered when opening a Live session
 */

import { Type } from '@google/genai';

export const TRUTHSTREAM_TOOLS = [
  {
    name: 'search_vectara',
    description: 'Search the trusted Vectara corpus for official/primary source evidence about a factual claim. Use precise queries with metric names, locations, and timeframes.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Precise search query (e.g., "Chicago violent crime YTD 2025 official dashboard")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_web',
    description: 'Search allow-listed web sources (.gov, .edu, official dashboards) for recent evidence about a factual claim.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Search query with optional site filters (e.g., "Chicago crime site:cityofchicago.org")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'context_check',
    description: 'Validate a claim for scope/metric/timeframe consistency. Returns warnings if the claim mixes incompatible metrics or timeframes.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        claim: {
          type: Type.STRING,
          description: 'The factual claim to validate',
        },
      },
      required: ['claim'],
    },
  },
];
