import { useState, useEffect, useRef } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'websocket-interception')!;

interface Message {
  id: number;
  text: string;
  from: 'server' | 'user';
  at: string;
}

let msgId = 1;

function ts() {
  return new Date().toLocaleTimeString();
}

export function WebSocketInterception() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    setStatus('connecting');
    setMessages([]);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      addMessage('Connected to server', 'server');
    };

    ws.onmessage = (e) => {
      addMessage(typeof e.data === 'string' ? e.data : '[binary]', 'server');
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
    };
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
  };

  const addMessage = (text: string, from: 'server' | 'user') => {
    setMessages((prev) => [...prev, { id: msgId++, text, from, at: ts() }]);
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(trimmed);
    addMessage(trimmed, 'user');
    setInput('');
  };

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  const statusColor: Record<typeof status, string> = {
    disconnected: 'bg-zinc-200 text-zinc-600',
    connecting: 'bg-amber-100 text-amber-700',
    connected: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-600',
  };

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-6 text-sm text-zinc-500">
        Use{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">page.routeWebSocket()</code> to fully
        mock the socket, selectively forward messages, or block specific frames.
      </p>

      <div className="space-y-10">
        {/* ── Connection controls ───────────────────────────────────────── */}
        <section aria-labelledby="ws-conn-heading">
          <h2 id="ws-conn-heading" className="mb-1 text-base font-semibold text-zinc-900">
            WebSocket connection
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Connect to <code className="rounded bg-zinc-100 px-1 text-xs">ws://localhost:3001/ws</code>.
            The server sends a welcome message and echoes everything you send back. A ticker
            message arrives every 3 seconds.
          </p>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={connect}
              disabled={status === 'connected' || status === 'connecting'}
              data-testid="ws-connect"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={disconnect}
              disabled={status !== 'connected'}
              data-testid="ws-disconnect"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Disconnect
            </button>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[status]}`}
              data-testid="ws-status"
              aria-label={`WebSocket status: ${status}`}
            >
              {status}
            </span>
          </div>

          {/* Message log */}
          <div
            aria-label="WebSocket message log"
            aria-live="polite"
            className="h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs"
          >
            {messages.length === 0 ? (
              <p className="text-zinc-400">No messages yet. Connect to start.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={msg.from === 'user' ? 'text-indigo-700' : 'text-zinc-700'}>
                  <span className="mr-2 text-zinc-400">[{msg.at}]</span>
                  <span className="mr-1 font-semibold">{msg.from === 'user' ? 'you' : 'server'}:</span>
                  {msg.text}
                </div>
              ))
            )}
          </div>

          {/* Send message */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'connected'}
              aria-label="Message to send"
              placeholder="Type a message…"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status !== 'connected' || !input.trim()}
              data-testid="ws-send"
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>

        {/* ── Challenge tiers ───────────────────────────────────────────── */}
        <section aria-labelledby="ws-challenges-heading">
          <h2 id="ws-challenges-heading" className="mb-3 text-base font-semibold text-zinc-900">
            Challenge tiers
          </h2>
          <div className="space-y-3">
            {[
              {
                n: 1,
                label: 'Full mock',
                desc: 'Use routeWebSocket() to intercept the URL and never connect to the real server. Send fake messages from the handler and assert the UI shows them.',
              },
              {
                n: 2,
                label: 'Selective forward',
                desc: 'Connect to the real server, forward most messages, but modify the "ticker" messages before they reach the page.',
              },
              {
                n: 3,
                label: 'Block frames',
                desc: 'Let the connection succeed but block outgoing messages containing the word "block". Assert the server never echoes them back.',
              },
            ].map(({ n, label, desc }) => (
              <div
                key={n}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <p className="mb-1 text-sm font-semibold text-zinc-800">
                  Challenge {n}: {label}
                </p>
                <p className="text-sm text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
