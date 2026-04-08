import { Task, sanitizeStoredTasks } from "@/lib/tasks";

const STORAGE_KEY = "todo-next-app.tasks";
let inMemoryTasks: Task[] = [];

export function loadPersistedTasks(): Task[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return inMemoryTasks;
    }

    const parsed = JSON.parse(raw) as unknown;
    const tasks = sanitizeStoredTasks(parsed);
    inMemoryTasks = tasks;
    return tasks;
  } catch {
    return inMemoryTasks;
  }
}

export function persistTasks(tasks: Task[]): void {
  inMemoryTasks = tasks;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage can be blocked in some browser contexts.
  }
}
