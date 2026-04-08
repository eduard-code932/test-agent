export const MAX_TITLE_LENGTH = 120;

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt?: number;
};

export type TaskFilter = "all" | "active" | "completed";

export type TodoState = {
  tasks: Task[];
  filter: TaskFilter;
};

export type TodoAction =
  | { type: "hydrate"; tasks: Task[] }
  | { type: "add"; task: Task }
  | { type: "toggle"; id: string; updatedAt: number }
  | { type: "update"; id: string; title: string; updatedAt: number }
  | { type: "delete"; id: string }
  | { type: "setFilter"; filter: TaskFilter }
  | { type: "clearCompleted" };

export const initialTodoState: TodoState = {
  tasks: [],
  filter: "all",
};

export function validateTaskTitle(
  rawTitle: string,
  maxLength = MAX_TITLE_LENGTH,
): { trimmedTitle: string; error: string | null } {
  const trimmedTitle = rawTitle.trim();

  if (!trimmedTitle) {
    return { trimmedTitle, error: "Task title cannot be empty." };
  }

  if (trimmedTitle.length > maxLength) {
    return {
      trimmedTitle,
      error: `Task title must be ${maxLength} characters or less.`,
    };
  }

  return { trimmedTitle, error: null };
}

export function createTask(
  title: string,
  options?: { id?: string; now?: number },
): Task {
  return {
    id: options?.id ?? generateTaskId(),
    title,
    completed: false,
    createdAt: options?.now ?? Date.now(),
  };
}

export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "hydrate":
      return { ...state, tasks: action.tasks };
    case "add":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "toggle":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                completed: !task.completed,
                updatedAt: action.updatedAt,
              }
            : task,
        ),
      };
    case "update":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, title: action.title, updatedAt: action.updatedAt }
            : task,
        ),
      };
    case "delete":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      };
    case "setFilter":
      return { ...state, filter: action.filter };
    case "clearCompleted":
      return {
        ...state,
        tasks: state.tasks.filter((task) => !task.completed),
      };
    default:
      return state;
  }
}

export function getFilteredTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case "active":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

export function getRemainingTaskCount(tasks: Task[]): number {
  return tasks.filter((task) => !task.completed).length;
}

export function sanitizeStoredTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const id = "id" in item ? item.id : undefined;
      const title = "title" in item ? item.title : undefined;
      const completed = "completed" in item ? item.completed : undefined;
      const createdAt = "createdAt" in item ? item.createdAt : undefined;
      const updatedAt = "updatedAt" in item ? item.updatedAt : undefined;

      if (
        typeof id !== "string" ||
        typeof title !== "string" ||
        typeof completed !== "boolean" ||
        typeof createdAt !== "number" ||
        !Number.isFinite(createdAt)
      ) {
        return null;
      }

      const { trimmedTitle, error } = validateTaskTitle(title);
      if (error) {
        return null;
      }

      return {
        id,
        title: trimmedTitle,
        completed,
        createdAt,
        updatedAt:
          typeof updatedAt === "number" && Number.isFinite(updatedAt)
            ? updatedAt
            : undefined,
      } satisfies Task;
    })
    .filter((task): task is Task => task !== null);
}

function generateTaskId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
