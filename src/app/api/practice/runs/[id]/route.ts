import { NextRequest, NextResponse } from 'next/server';

import {
  deleteRun,
  getRun,
} from '@/features/practice-labs/api-request-testing/run-fixtures';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/practice/runs/[id]
 *
 * Returns a single test run by id.
 *
 * Responses:
 *   200  — TestRun
 *   404  — { error }
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const run = getRun(id);
  if (!run) {
    return NextResponse.json({ error: `Run '${id}' not found.` }, { status: 404 });
  }
  return NextResponse.json(run);
}

/**
 * DELETE /api/practice/runs/[id]
 *
 * Deletes a test run by id.
 *
 * Responses:
 *   204  — No Content (run removed)
 *   404  — { error } (run not found)
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const removed = deleteRun(id);
  if (!removed) {
    return NextResponse.json({ error: `Run '${id}' not found.` }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
