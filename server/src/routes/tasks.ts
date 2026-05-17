import { Router } from 'express';

interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

let tasks: Task[] = [
  { id: 1, title: 'Write a Playwright test', done: false, createdAt: new Date().toISOString() },
  { id: 2, title: 'Use the request fixture', done: false, createdAt: new Date().toISOString() },
  {
    id: 3,
    title: 'Seed data via API before UI test',
    done: false,
    createdAt: new Date().toISOString(),
  },
];
let nextId = 4;

const router = Router();

router.get('/', (_req, res) => {
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { title } = req.body as { title: unknown };
  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ error: 'title is required' });
    return;
  }
  const task: Task = {
    id: nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  const { title, done } = req.body as { title?: unknown; done?: unknown };
  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'title must be a non-empty string' });
      return;
    }
    task.title = title.trim();
  }
  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      res.status(400).json({ error: 'done must be a boolean' });
      return;
    }
    task.done = done;
  }
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  tasks.splice(idx, 1);
  res.status(204).send();
});

export default router;
