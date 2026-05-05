'use client';

import { useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  formatCoordinate,
  formatEffectiveType,
  geolocationErrorMessage,
  type GeolocationStatus,
  type NetworkStatus,
  type PreferenceStatus,
} from './browser-api-state';

const CHALLENGE_ID = 'mock-browser-apis';
const OBJECTIVE =
  'Use page.addInitScript() to replace browser globals with deterministic mock implementations before any page script runs, then verify the UI correctly reflects the injected values.';

// ─── Top-level lab component ───────────────────────────────────────────────────

export function MockBrowserApisLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Mock Browser APIs Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <MockBrowserApisContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

function MockBrowserApisContent() {
  return (
    <div className="space-y-6">
      <GeolocationPanel />
      <NetworkStatusPanel />
      <UserPreferencesPanel />
    </div>
  );
}

// ─── Panel 1: Geolocation ─────────────────────────────────────────────────────

function GeolocationPanel() {
  const [status, setStatus] = useState<GeolocationStatus>({ kind: 'idle' });

  function requestLocation() {
    if (!navigator.geolocation) {
      setStatus({
        kind: 'error',
        code: 2,
        message: geolocationErrorMessage(2),
      });
      return;
    }

    setStatus({ kind: 'detecting' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus({
          kind: 'success',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        setStatus({
          kind: 'error',
          code: error.code,
          message: geolocationErrorMessage(error.code),
        });
      },
      { timeout: 5000 },
    );
  }

  return (
    <section aria-label="Geolocation panel" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 1 — Geolocation
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Reads the device location via{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            navigator.geolocation
          </code>
          . Use{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            page.addInitScript()
          </code>{' '}
          to inject a mock implementation that resolves with known coordinates.
        </p>
      </div>

      <button
        type="button"
        onClick={requestLocation}
        disabled={status.kind === 'detecting'}
        aria-label="Request location"
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition enabled:hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span aria-hidden="true">📍</span>
        Request Location
      </button>

      {status.kind === 'idle' && (
        <p role="status" className="text-sm text-muted-foreground">
          Location not requested yet.
        </p>
      )}

      {status.kind === 'detecting' && (
        <p role="status" aria-live="polite" className="text-sm font-semibold text-secondary">
          Detecting location…
        </p>
      )}

      {status.kind === 'success' && (
        <div
          role="status"
          aria-label="Location result"
          className="rounded-2xl border border-success/30 bg-success/8 px-5 py-4 space-y-2"
        >
          <p className="text-sm font-bold text-success">Location obtained</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Latitude</dt>
            <dd className="font-mono font-semibold text-card-foreground" aria-label="Latitude">
              {formatCoordinate(status.latitude)}
            </dd>
            <dt className="text-muted-foreground">Longitude</dt>
            <dd className="font-mono font-semibold text-card-foreground" aria-label="Longitude">
              {formatCoordinate(status.longitude)}
            </dd>
            <dt className="text-muted-foreground">Accuracy (m)</dt>
            <dd className="font-mono font-semibold text-card-foreground" aria-label="Accuracy">
              {formatCoordinate(status.accuracy)}
            </dd>
          </dl>
        </div>
      )}

      {status.kind === 'error' && (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/8 px-5 py-4 space-y-1"
        >
          <p className="text-sm font-bold text-danger">Location unavailable</p>
          <p className="text-sm text-muted-foreground">{status.message}</p>
        </div>
      )}
    </section>
  );
}

// ─── Panel 2: Network Status ──────────────────────────────────────────────────

function NetworkStatusPanel() {
  const [status, setStatus] = useState<NetworkStatus>({ kind: 'idle' });

  function checkConnection() {
    // navigator.connection is not available in all browsers (it's an experimental API).
    const connection = (
      navigator as Navigator & {
        connection?: { effectiveType?: string; downlink?: number };
      }
    ).connection;

    setStatus({
      kind: 'detected',
      online: navigator.onLine,
      effectiveType: connection?.effectiveType ?? null,
      downlink: connection?.downlink ?? null,
    });
  }

  return (
    <section aria-label="Network status panel" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 2 — Network Status
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Reads{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">navigator.onLine</code>{' '}
          and{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            navigator.connection
          </code>
          . Use{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            page.addInitScript()
          </code>{' '}
          to override the online flag and connection type before the page loads.
        </p>
      </div>

      <button
        type="button"
        onClick={checkConnection}
        aria-label="Check connection status"
        className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-5 py-2.5 text-sm font-bold text-secondary transition hover:bg-secondary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span aria-hidden="true">🌐</span>
        Check Connection
      </button>

      {status.kind === 'idle' && (
        <p role="status" className="text-sm text-muted-foreground">
          Connection not checked yet.
        </p>
      )}

      {status.kind === 'detected' && (
        <div
          role="status"
          aria-label="Connection result"
          className={`rounded-2xl border px-5 py-4 space-y-2 ${
            status.online
              ? 'border-success/30 bg-success/8'
              : 'border-danger/30 bg-danger/8'
          }`}
        >
          <p
            className={`text-sm font-bold ${status.online ? 'text-success' : 'text-danger'}`}
            aria-label="Online status"
          >
            {status.online ? 'Online' : 'Offline'}
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Effective type</dt>
            <dd
              className="font-mono font-semibold text-card-foreground"
              aria-label="Effective connection type"
            >
              {formatEffectiveType(status.effectiveType)}
            </dd>
            <dt className="text-muted-foreground">Downlink (Mbps)</dt>
            <dd
              className="font-mono font-semibold text-card-foreground"
              aria-label="Downlink speed"
            >
              {status.downlink !== null ? status.downlink.toFixed(2) : 'unknown'}
            </dd>
          </dl>
        </div>
      )}
    </section>
  );
}

// ─── Panel 3: User Preferences ────────────────────────────────────────────────

function UserPreferencesPanel() {
  const [status, setStatus] = useState<PreferenceStatus>({ kind: 'idle' });

  function detectPreferences() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setStatus({ kind: 'detected', reducedMotion, darkMode });
  }

  return (
    <section aria-label="User preferences panel" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 3 — User Preferences
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Reads{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            window.matchMedia
          </code>{' '}
          for reduced-motion and color-scheme preferences. Use{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            page.addInitScript()
          </code>{' '}
          to inject a mock{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">matchMedia</code> that
          returns controlled values.
        </p>
      </div>

      <button
        type="button"
        onClick={detectPreferences}
        aria-label="Detect user preferences"
        className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-bold text-accent-foreground transition hover:bg-accent/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span aria-hidden="true">⚙</span>
        Detect Preferences
      </button>

      {status.kind === 'idle' && (
        <p role="status" className="text-sm text-muted-foreground">
          Preferences not detected yet.
        </p>
      )}

      {status.kind === 'detected' && (
        <div
          role="status"
          aria-label="Preferences result"
          className="rounded-2xl border border-secondary/30 bg-secondary/8 px-5 py-4 space-y-2"
        >
          <p className="text-sm font-bold text-secondary">Preferences detected</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Reduced motion</dt>
            <dd
              className="font-semibold text-card-foreground"
              aria-label="Reduced motion preference"
            >
              {status.reducedMotion ? 'Preferred' : 'Not preferred'}
            </dd>
            <dt className="text-muted-foreground">Color scheme</dt>
            <dd
              className="font-semibold text-card-foreground"
              aria-label="Color scheme preference"
            >
              {status.darkMode ? 'Dark' : 'Light'}
            </dd>
          </dl>
        </div>
      )}
    </section>
  );
}
