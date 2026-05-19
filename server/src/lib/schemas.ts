import { z } from 'zod';

const nonBlankString = (message: string) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, message));

export const CreateTaskSchema = z.object({
  title: nonBlankString('title is required'),
});

export const UpdateTaskSchema = z.object({
  title: nonBlankString('title must be a non-empty string').optional(),
  done: z.boolean({ error: 'done must be a boolean' }).optional(),
});

export const CreateNoteSchema = z.object({
  text: nonBlankString('text is required'),
});
