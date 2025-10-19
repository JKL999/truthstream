/**
 * Tool endpoint: context_check
 * Mock implementation validating claim consistency
 * TODO: Replace with actual context analysis agent
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ContextCheckInputSchema,
  ContextCheckOutput,
} from '../_lib/toolSchemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = ContextCheckInputSchema.parse(body);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Simple pattern matching for demo
    const claim = input.claim.toLowerCase();
    const warnings: string[] = [];
    let ok = true;

    // Check for common mismatches
    if (claim.includes('crime') && !claim.includes('violent')) {
      if (claim.includes('violent') || claim.includes('murder') || claim.includes('assault')) {
        // Specific violent crime mentioned, OK
      } else {
        warnings.push(
          'Claim uses general "crime" but may conflate with violent crime statistics. Verify metric scope.'
        );
        ok = false;
      }
    }

    // Check for timeframe clarity
    if (claim.includes('this year')) {
      if (!claim.includes('ytd') && !claim.includes('year-to-date')) {
        warnings.push(
          'Claim says "this year" but unclear if YTD or full calendar year. Check timeframe alignment.'
        );
      }
    }

    // Check for per-capita vs absolute
    if (claim.match(/\d+%/) && claim.includes('population')) {
      warnings.push(
        'Percentage change with population context—verify if rate is per-capita or absolute count.'
      );
    }

    const response: ContextCheckOutput = {
      ok: warnings.length === 0,
      warnings,
      notes: warnings.length > 0
        ? 'Normalize claim to specific metric, location, and timeframe before final verdict.'
        : 'Claim appears internally consistent.',
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: { code: 'INVALID_ARGUMENT', message: error.message } },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unknown error' } },
      { status: 500 }
    );
  }
}
