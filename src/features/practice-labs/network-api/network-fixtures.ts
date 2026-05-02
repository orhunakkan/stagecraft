// ─── Types ─────────────────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SupportTicket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  assignee: string;
  created: string;
}

export interface TicketListResponse {
  items: SupportTicket[];
  fetchedAt: string;
  total: number;
}

export interface ApiErrorResponse {
  error: string;
  code: number;
}

// ─── Deterministic fixture data ─────────────────────────────────────────────────

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'T-001',
    title: 'Login page throws 500 on mobile Safari',
    status: 'open',
    priority: 'critical',
    category: 'Auth',
    assignee: 'Maya Chen',
    created: '2025-04-28',
  },
  {
    id: 'T-002',
    title: 'Password reset email not delivered',
    status: 'in-progress',
    priority: 'high',
    category: 'Auth',
    assignee: 'Sam Rivera',
    created: '2025-04-27',
  },
  {
    id: 'T-003',
    title: 'Cart total incorrect when coupon applied',
    status: 'open',
    priority: 'high',
    category: 'Checkout',
    assignee: 'Alex Kim',
    created: '2025-04-26',
  },
  {
    id: 'T-004',
    title: 'File upload fails for attachments over 5 MB',
    status: 'in-progress',
    priority: 'medium',
    category: 'Files',
    assignee: 'Jordan Lee',
    created: '2025-04-25',
  },
  {
    id: 'T-005',
    title: 'Dark mode preference not persisted across sessions',
    status: 'resolved',
    priority: 'low',
    category: 'UI/UX',
    assignee: 'Casey Morgan',
    created: '2025-04-24',
  },
  {
    id: 'T-006',
    title: 'Search returns incorrect results for multi-word queries',
    status: 'open',
    priority: 'critical',
    category: 'Search',
    assignee: 'Taylor Brooks',
    created: '2025-04-23',
  },
  {
    id: 'T-007',
    title: 'Invoice PDF missing line items for bundled products',
    status: 'resolved',
    priority: 'medium',
    category: 'Billing',
    assignee: 'Dana White',
    created: '2025-04-22',
  },
  {
    id: 'T-008',
    title: 'Session expires after 5 minutes of inactivity',
    status: 'open',
    priority: 'high',
    category: 'Auth',
    assignee: 'Maya Chen',
    created: '2025-04-21',
  },
];

export const VALID_STATUSES: TicketStatus[] = ['open', 'in-progress', 'resolved', 'closed'];
export const VALID_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];

/** Human-readable labels for each ticket status. */
export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

/** Human-readable labels for each priority level. */
export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// ─── Response builders ─────────────────────────────────────────────────────────

/**
 * Builds a deterministic success response using the shared ticket fixtures.
 * `fetchedAt` should be an ISO 8601 string from the time of the request.
 */
export function buildTicketListResponse(fetchedAt: string): TicketListResponse {
  return {
    items: SUPPORT_TICKETS,
    fetchedAt,
    total: SUPPORT_TICKETS.length,
  };
}

/** Builds a standardised simulated error response body. */
export function buildErrorResponse(): ApiErrorResponse {
  return { error: 'Service temporarily unavailable', code: 503 };
}
