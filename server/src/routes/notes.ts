import { Router } from 'express';
import { CreateNoteSchema, firstIssueMessage } from '../lib/schemas';

interface Note {
  id: number;
  text: string;
  createdAt: string;
}

const notes: Note[] = [
  {
    id: 1,
    text: 'Intercept network requests with page.route()',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    text: 'Use waitForResponse() to synchronise on API calls',
    createdAt: new Date().toISOString(),
  },
  { id: 3, text: 'Mock responses with route.fulfill()', createdAt: new Date().toISOString() },
];
let nextId = 4;

const router = Router();

router.get('/', (_req, res) => {
  res.json(notes);
});

router.post('/', (req, res) => {
  const result = CreateNoteSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: firstIssueMessage(result.error, 'text is required') });
    return;
  }
  const note: Note = { id: nextId++, text: result.data.text, createdAt: new Date().toISOString() };
  notes.push(note);
  res.status(201).json(note);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  notes.splice(idx, 1);
  res.status(204).send();
});

export default router;
