// ─── Delay constants (milliseconds) ────────────────────────────────────────────

export const CLOCK_DELAYS = {
  /** Full session countdown duration. */
  countdown: 5 * 60 * 1000, // 5 minutes
  /** How often the auto-refresh panel refreshes. */
  autoRefresh: 30 * 1000, // 30 seconds
  /** Tick interval for the live clock and the countdown. */
  clockTick: 1000, // 1 second
} as const;

// ─── State types ────────────────────────────────────────────────────────────────

export type CountdownState = 'idle' | 'running' | 'expired';
export type AutoRefreshState = 'idle' | 'running';

// ─── Pure helpers ───────────────────────────────────────────────────────────────

/**
 * Formats a millisecond duration as "M:SS".
 *
 * Examples:
 *   formatCountdown(300_000) → "5:00"
 *   formatCountdown(59_000)  → "0:59"
 *   formatCountdown(0)       → "0:00"
 *   formatCountdown(-1000)   → "0:00"  (clamped to zero)
 */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes)}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats a Date as a human-readable "YYYY-MM-DD HH:MM:SS" string using
 * local time. Used by the live clock display scenario.
 *
 * The format is intentionally simple and locale-independent so learners can
 * assert the exact string value after calling page.clock.setFixedTime().
 */
export function formatClockDisplay(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${String(year)}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
