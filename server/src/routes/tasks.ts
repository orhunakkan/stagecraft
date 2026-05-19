import { Router } from 'express';
import { CreateTaskSchema, UpdateTaskSchema } from '../lib/schemas';

interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

const tasks: Task[] = [
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
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? 'title is required' });
    return;
  }
  const task: Task = {
    id: nextId++,
    title: result.data.title,
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
  const result = UpdateTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? 'invalid request' });
    return;
  }
  if (result.data.title !== undefined) task.title = result.data.title;
  if (result.data.done !== undefined) task.done = result.data.done;
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
