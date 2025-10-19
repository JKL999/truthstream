/**
 * Tool endpoint: search_vectara
 * Mock implementation returning realistic Chicago crime data
 * TODO: Replace with actual Vectara API integration
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SearchVectaraInputSchema,
  SearchVectaraOutput,
} from '../_lib/toolSchemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = SearchVectaraInputSchema.parse(body);

    // Mock delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock evidence based on query
    const mockEvidence: SearchVectaraOutput = {
      items: [
        {
          publisher: 'Chicago Police Department Data Portal',
          url: 'https://data.cityofchicago.org/Public-Safety/Crimes-2024/ijzp-q8t2',
          as_of: '2025-09-30',
          snippet:
            'Violent crime incidents YTD through September 2025 show a 16.7% decrease compared to the same period in 2024. Total violent crimes: 8,234 (2025) vs 9,884 (2024).',
          alignment: 'supports',
          score: 0.88,
          tier: 'primary',
        },
        {
          publisher: 'Chicago Data Dashboard - Crime Stats',
          url: 'https://www.chicago.gov/city/en/sites/public-safety/home/crime-stats.html',
          as_of: '2025-10-01',
          snippet:
            'Citywide violent crime trending down 17.2% year-over-year as of Q3 2025, with notable decreases in aggravated assault (-18.4%) and robbery (-15.1%).',
          alignment: 'supports',
          score: 0.82,
          tier: 'primary',
        },
        {
          publisher: 'Illinois State Police Crime Reporting Unit',
          url: 'https://isp.illinois.gov/CrimeReporting',
          as_of: '2025-08-15',
          snippet:
            'Illinois UCR data for Cook County shows violent crime index decreased 14.3% in first 8 months of 2025 compared to 2024.',
          alignment: 'supports',
          score: 0.75,
          tier: 'secondary',
        },
      ],
    };

    // Filter by top_k
    const filtered = {
      items: mockEvidence.items.slice(0, input.top_k || 5),
    };

    return NextResponse.json(filtered);
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
