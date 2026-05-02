import { NextRequest, NextResponse } from 'next/server';

import {
  buildErrorResponse,
  buildTicketListResponse,
} from '@/features/practice-labs/network-api/network-fixtures';

/**
 * GET /api/practice/network/items
 *
 * Returns a deterministic list of support tickets for the Network/API Lab.
 *
 * Query params:
 *   ?scenario=error  →  HTTP 503 with a structured error body (for error-state practice)
 *
 * All data is local and deterministic. No external services are called.
 */
export async function GET(request: NextRequest) {
  const scenario = request.nextUrl.searchParams.get('scenario');

  if (scenario === 'error') {
    return NextResponse.json(buildErrorResponse(), { status: 503 });
  }

  return NextResponse.json(buildTicketListResponse(new Date().toISOString()));
}
