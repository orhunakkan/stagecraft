import { useState } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'console-runtime-diagnostics')!;

interface DiagnosticAction {
  label: string;
  run: (record: (entry: string) => void) => void;
}

const actions: DiagnosticAction[] = [
  {
    label: 'Log info',
    run: (record) => {
      console.log('Info message logged');
      record('Logged an info message');
    },
  },
  {
    label: 'Log warning',
    run: (record) => {
      console.warn('Warning message logged');
      record('Logged a warning message');
    },
  },
  {
    label: 'Log error',
    run: (record) => {
      console.error('Error message logged');
      record('Logged an error message');
    },
  },
  {
    label: 'Throw uncaught error',
    run: (record) => {
      record('Threw an uncaught error');
      setTimeout(() => {
        throw new Error('Uncaught runtime error triggered from the lab');
      }, 0);
    },
  },
  {
    label: 'Reject a promise',
    run: (record) => {
      record('Rejected a promise without a catch handler');
      void Promise.reject(new Error('Unhandled rejection triggered from the lab'));
    },
  },
  {
    label: 'Fetch a missing resource',
    run: (record) => {
      record('Requested a missing resource');
      void fetch('/diagnostics-lab/missing-resource');
    },
  },
];

export function ConsoleRuntimeDiagnostics() {
  const [log, setLog] = useState<string[]>([]);

  const record = (entry: string) => setLog((prev) => [...prev, entry]);

  return (
    <div>
      <LabHeader lab={lab} />

      <div className="max-w-md space-y-6">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => action.run(record)}
              className="rounded-lg border border-edge px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-canvas"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-edge bg-surface p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Action log</h2>
          <ol data-testid="action-log" className="mt-2 space-y-1 text-sm text-content">
            {log.length === 0 && <li className="text-muted">No actions triggered yet.</li>}
            {log.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
