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
