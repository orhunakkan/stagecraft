export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export function assertOk(response: Response): void {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

export async function readJson<T>(response: Response): Promise<T> {
  assertOk(response);
  return (await response.json()) as T;
}
