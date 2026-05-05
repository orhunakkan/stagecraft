import { NextRequest, NextResponse } from 'next/server';

import {
  createRun,
  getStore,
  resetStore,
  validateCreateRunInput,
  type CreateRunInput,
} from '@/features/practice-labs/api-request-testing/run-fixtures';

/**
 * GET /api/practice/runs
 *
 * Returns all test runs in the in-memory store.
 *
 * Query params:
 *   ?reset=true  →  Resets the store to seed data before responding.
 *                   Useful in e2e tests to restore a predictable state.
 *
 * Response: RunListResponse  — { runs, total, seeded }
 */
export async function GET(request: NextRequest) {
  const shouldReset = request.nextUrl.searchParams.get('reset') === 'true';
  if (shouldReset) resetStore();

  const { runs, seeded } = getStore();
  return NextResponse.json({ runs, total: runs.length, seeded });
}

/**
 * POST /api/practice/runs
 *
 * Creates a new test run.
 *
 * Body: { name: string; status: RunStatus; durationMs?: number | null }
 *
 * Responses:
 *   201  — Created run
 *   400  — Validation error { error, field }
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.', field: 'body' },
      { status: 400 },
    );
  }

  const validationError = validateCreateRunInput(body);
  if (validationError) {
    return NextResponse.json(validationError, { status: 400 });
  }

  const input = body as CreateRunInput;
  const run = createRun(input);
  return NextResponse.json(run, { status: 201 });
}
