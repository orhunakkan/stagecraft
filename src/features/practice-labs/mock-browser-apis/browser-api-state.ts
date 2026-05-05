// Panel state types for the Mock Browser APIs Lab.
// Each panel has an idle state and a detected state that holds the read values.

// ─── Geolocation panel ────────────────────────────────────────────────────────

export type GeolocationStatus =
  | { kind: 'idle' }
  | { kind: 'detecting' }
  | { kind: 'success'; latitude: number; longitude: number; accuracy: number }
  | { kind: 'error'; code: number; message: string };

// ─── Network status panel ─────────────────────────────────────────────────────

export type NetworkStatus =
  | { kind: 'idle' }
  | { kind: 'detected'; online: boolean; effectiveType: string | null; downlink: number | null };

// ─── User preferences panel ───────────────────────────────────────────────────

export type PreferenceStatus =
  | { kind: 'idle' }
  | { kind: 'detected'; reducedMotion: boolean; darkMode: boolean };

// ─── Display helpers ─────────────────────────────────────────────────────────

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function formatEffectiveType(type: string | null): string {
  return type ?? 'unknown';
}

export function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Permission denied by user or browser policy.';
    case 2:
      return 'Position unavailable — could not determine location.';
    case 3:
      return 'Request timed out before a position was obtained.';
    default:
      return 'An unknown geolocation error occurred.';
  }
}
