'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'websockets';
const OBJECTIVE = 'Mock real-time WebSocket communication to test live UI updates.';
const WEBSOCKET_URL = '/api/practice/websockets'; // This is a placeholder for interception

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
interface FeedMessage {
  id: string;
  type: 'info' | 'event';
  text: string;
}

export function WebSocketLab() {
  const { resetKey, triggerReset } = useLabReset();
  return (
    <PracticeLabLayout
      labTitle="WebSocket Testing Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <WebSocketContent key={resetKey} />
    </PracticeLabLayout>
  );
}

function WebSocketContent() {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws.current) return;

    setStatus('connecting');
    setMessages([{ id: 'init', type: 'info', text: 'Attempting to connect...' }]);

    // In a real app, this URL would point to a live WebSocket server.
    // For this lab, Playwright will intercept this URL.
    const socket = new WebSocket(WEBSOCKET_URL);
    ws.current = socket;

    socket.onopen = () => {
      setStatus('connected');
      setMessages((prev) => [
        ...prev,
        { id: 'open', type: 'info', text: 'Connection established.' },
      ]);
      // Let the (mock) server know we are ready
      socket.send(JSON.stringify({ type: 'subscribe', channel: 'live-updates' }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newMessage: FeedMessage = {
          id: data.id || new Date().toISOString(),
          type: 'event',
          text: data.message || 'Received an unformatted message.',
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (e) {
        console.error('Failed to parse incoming message:', event.data);
      }
    };

    socket.onerror = () => {
      setStatus('error');
      setMessages((prev) => [
        ...prev,
        { id: 'error', type: 'info', text: 'Connection failed.' },
      ]);
    };

    socket.onclose = () => {
      if (status !== 'error') {
        setStatus('idle');
        setMessages((prev) => [
          ...prev,
          { id: 'close', type: 'info', text: 'Disconnected.' },
        ]);
      }
      ws.current = null;
    };
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ws.current?.close();
    };
  }, []);

  return (
    <section aria-labelledby="feed-heading" className="stage-card p-6 space-y-5">
      <div>
        <h2 id="feed-heading" className="text-xl font-black tracking-tight text-card-foreground">
          Live Activity Feed
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Click &quot;Connect&quot; to subscribe to real-time status updates. Tests should intercept
          the WebSocket request and mock the server responses.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={connect}
          disabled={status === 'connecting' || status === 'connected'}
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:opacity-50"
        >
          {status === 'connected' ? 'Connected' : 'Connect'}
        </button>
        <ConnectionStatusIndicator status={status} />
      </div>

      <ActivityFeed feed={messages} />
    </section>
  );
}

function ConnectionStatusIndicator({ status }: { status: ConnectionStatus }) {
  const statusMap = {
    idle: { text: 'Idle', color: 'bg-muted-foreground' },
    connecting: { text: 'Connecting...', color: 'bg-warning' },
    connected: { text: 'Connected', color: 'bg-success' },
    error: { text: 'Error', color: 'bg-danger' },
  };
  const { text, color } = statusMap[status];

  return (
    <div role="status" className="flex items-center gap-2">
      <span className={`inline-block size-2 rounded-full ${color}`} />
      <span className="text-sm font-semibold text-muted-foreground">{text}</span>
    </div>
  );
}

function ActivityFeed({ feed }: { feed: FeedMessage[] }) {
  return (
    <div className="h-64 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      {feed.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
      )}
      <ul className="space-y-3">
        {feed.map((msg) => (
          <li
            key={msg.id}
            className={`text-sm ${msg.type === 'info' ? 'text-muted-foreground' : 'text-card-foreground'}`}
          >
            <span className="font-mono">{msg.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
