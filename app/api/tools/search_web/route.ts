/**
 * Tool endpoint: search_web
 * Mock implementation returning realistic FBI/gov source data
 * TODO: Replace with actual web search + scraping
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  SearchWebInputSchema,
  SearchWebOutput,
} from '../_lib/toolSchemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = SearchWebInputSchema.parse(body);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Mock web search results
    const mockResults: SearchWebOutput = {
      items: [
        {
          publisher: 'FBI Uniform Crime Reporting (UCR)',
          url: 'https://ucr.fbi.gov/crime-in-the-u.s/2024/preliminary-report',
          as_of: '2024-10-15',
          snippet:
            'Preliminary 2024 UCR data indicates violent crime decreased 16.7% nationwide in the first nine months compared to 2023. Chicago metro area showed similar trends.',
          alignment: 'supports',
          score: 0.79,
          tier: 'primary',
        },
        {
          publisher: 'National Institute of Justice',
          url: 'https://nij.ojp.gov/topics/articles/violent-crime-trends-2024',
          as_of: '2024-11-20',
          snippet:
            'NIJ analysis of major metropolitan areas confirms sustained violent crime reductions in 2024, with Chicago reporting approximately 17% decline YTD.',
          alignment: 'supports',
          score: 0.71,
          tier: 'analysis',
        },
        {
          publisher: 'City of Chicago Official Newsroom',
          url: 'https://www.chicago.gov/city/en/depts/mayor/press_room/press_releases/2025/october/crime-stats.html',
          as_of: '2025-10-05',
          snippet:
            'Mayor announces violent crime down 17% through September 2025 compared to prior year, attributing success to community policing initiatives.',
          alignment: 'supports',
          score: 0.68,
          tier: 'secondary',
        },
      ],
    };

    const filtered = {
      items: mockResults.items.slice(0, input.top_k || 5),
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
