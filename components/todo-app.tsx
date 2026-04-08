"use client";

import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";
import { FilterControls } from "@/components/filter-controls";
import { TaskItem } from "@/components/task-item";
import { loadPersistedTasks, persistTasks } from "@/lib/task-storage";
import {
  createTask,
  getFilteredTasks,
  getRemainingTaskCount,
  initialTodoState,
  todoReducer,
  validateTaskTitle,
} from "@/lib/tasks";

export function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const filteredTasks = useMemo(
    () => getFilteredTasks(state.tasks, state.filter),
    [state.tasks, state.filter],
  );

  const completedCount = state.tasks.filter((task) => task.completed).length;
  const remainingCount = getRemainingTaskCount(state.tasks);

  useEffect(() => {
    const tasks = loadPersistedTasks();
    dispatch({ type: "hydrate", tasks });
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    persistTasks(state.tasks);
  }, [state.tasks, hasHydrated]);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { trimmedTitle, error } = validateTaskTitle(newTaskTitle);

    if (error) {
      setValidationMessage(error);
      return;
    }

    dispatch({ type: "add", task: createTask(trimmedTitle) });
    setNewTaskTitle("");
    setValidationMessage(null);
  };

  const updateTask = (id: string, nextTitle: string): string | null => {
    const { trimmedTitle, error } = validateTaskTitle(nextTitle);
    if (error) {
      return error;
    }

    dispatch({
      type: "update",
      id,
      title: trimmedTitle,
      updatedAt: Date.now(),
    });
    return null;
  };

  const emptyStateMessage =
    state.filter === "active"
      ? "No active tasks."
      : state.filter === "completed"
        ? "No completed tasks."
        : "No tasks yet. Add your first task above.";

  return (
    <main className="todo-page">
      <section aria-label="To-do list application" className="todo-card">
        <header className="todo-header">
          <h1 className="todo-title">To-Do List</h1>
          <p className="todo-subtitle">
            {remainingCount} remaining • {completedCount} completed
          </p>
        </header>

        <form className="todo-form" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task-input">
            Add a task
          </label>
          <input
            aria-describedby="new-task-feedback"
            aria-invalid={validationMessage ? "true" : "false"}
            className="todo-input"
            id="new-task-input"
            maxLength={120}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="What needs to be done?"
            value={newTaskTitle}
          />
          <button className="button button-primary" type="submit">
            Add Task
          </button>
        </form>
        <p
          aria-live="polite"
          className="validation-message"
          id="new-task-feedback"
        >
          {validationMessage ?? ""}
        </p>

        <FilterControls
          activeFilter={state.filter}
          completedCount={completedCount}
          onClearCompleted={() => dispatch({ type: "clearCompleted" })}
          onFilterChange={(filter) => dispatch({ type: "setFilter", filter })}
        />

        {filteredTasks.length === 0 ? (
          <p className="empty-state" role="status">
            {emptyStateMessage}
          </p>
        ) : (
          <ul className="todo-list">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                onDelete={(id) => dispatch({ type: "delete", id })}
                onToggle={(id) =>
                  dispatch({ type: "toggle", id, updatedAt: Date.now() })
                }
                onUpdate={updateTask}
                task={task}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
