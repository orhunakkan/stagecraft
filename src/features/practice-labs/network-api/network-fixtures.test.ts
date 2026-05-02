import { describe, expect, it } from 'vitest';

import {
  buildErrorResponse,
  buildTicketListResponse,
  PRIORITY_LABELS,
  SUPPORT_TICKETS,
  STATUS_LABELS,
  VALID_PRIORITIES,
  VALID_STATUSES,
  type SupportTicket,
} from './network-fixtures';

describe('SUPPORT_TICKETS', () => {
  it('has at least one ticket', () => {
    expect(SUPPORT_TICKETS.length).toBeGreaterThan(0);
  });

  it('every ticket has the required string fields', () => {
    for (const ticket of SUPPORT_TICKETS) {
      const fields: (keyof SupportTicket)[] = [
        'id',
        'title',
        'status',
        'priority',
        'category',
        'assignee',
        'created',
      ];
      for (const field of fields) {
        expect(ticket[field], `ticket ${ticket.id} is missing field "${field}"`).toBeTruthy();
      }
    }
  });

  it('all ticket IDs are unique', () => {
    const ids = SUPPORT_TICKETS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all statuses are valid', () => {
    for (const ticket of SUPPORT_TICKETS) {
      expect(VALID_STATUSES, `ticket ${ticket.id} has invalid status "${ticket.status}"`).toContain(
        ticket.status,
      );
    }
  });

  it('all priorities are valid', () => {
    for (const ticket of SUPPORT_TICKETS) {
      expect(
        VALID_PRIORITIES,
        `ticket ${ticket.id} has invalid priority "${ticket.priority}"`,
      ).toContain(ticket.priority);
    }
  });
});

describe('STATUS_LABELS', () => {
  it('has a non-empty label for every valid status', () => {
    for (const status of VALID_STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
  });
});

describe('PRIORITY_LABELS', () => {
  it('has a non-empty label for every valid priority', () => {
    for (const priority of VALID_PRIORITIES) {
      expect(PRIORITY_LABELS[priority]).toBeTruthy();
    }
  });
});

describe('buildTicketListResponse', () => {
  const fetchedAt = '2025-01-01T12:00:00.000Z';

  it('returns all tickets', () => {
    const response = buildTicketListResponse(fetchedAt);
    expect(response.items).toBe(SUPPORT_TICKETS);
    expect(response.total).toBe(SUPPORT_TICKETS.length);
  });

  it('includes the provided fetchedAt timestamp', () => {
    const response = buildTicketListResponse(fetchedAt);
    expect(response.fetchedAt).toBe(fetchedAt);
  });

  it('total matches the length of items', () => {
    const response = buildTicketListResponse(fetchedAt);
    expect(response.total).toBe(response.items.length);
  });
});

describe('buildErrorResponse', () => {
  it('returns a non-empty error message and a numeric code', () => {
    const response = buildErrorResponse();
    expect(response.error).toBeTruthy();
    expect(typeof response.code).toBe('number');
  });

  it('returns 503 as the code', () => {
    expect(buildErrorResponse().code).toBe(503);
  });
});
