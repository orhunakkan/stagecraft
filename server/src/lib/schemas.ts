import { z } from 'zod';
import type { ZodError } from 'zod';

const nonBlankString = (message: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, message));

export function firstIssueMessage(error: ZodError, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

export const CreateTaskSchema = z.object({
  title: nonBlankString('title is required'),
});

export const UpdateTaskSchema = z
  .object({
    title: nonBlankString('title must be a non-empty string').optional(),
    done: z.boolean({ error: 'done must be a boolean' }).optional(),
  })
  .refine((data) => data.title !== undefined || data.done !== undefined, {
    message: 'at least one task field is required',
  });

export const CreateNoteSchema = z.object({
  text: nonBlankString('text is required'),
});

export const AuditLogQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
    username: z
      .string()
      .transform((s) => s.trim())
      .optional(),
    from: z.union([z.iso.datetime({ offset: true }), z.iso.date()]).optional(),
    to: z.union([z.iso.datetime({ offset: true }), z.iso.date()]).optional(),
    sort: z.enum(['createdAt:asc', 'createdAt:desc']).optional().default('createdAt:desc'),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: 'from must not be later than to',
    path: ['from'],
  });
