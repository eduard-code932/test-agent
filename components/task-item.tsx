"use client";

import { FormEvent, useState } from "react";
import { Task } from "@/lib/tasks";

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, nextTitle: string) => string | null;
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [editError, setEditError] = useState<string | null>(null);

  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = onUpdate(task.id, draftTitle);
    if (error) {
      setEditError(error);
      return;
    }

    setEditError(null);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="todo-item">
        <form className="edit-form" onSubmit={saveEdit}>
          <label htmlFor={`edit-${task.id}`} className="sr-only">
            Edit task title
          </label>
          <input
            aria-invalid={editError ? "true" : "false"}
            className="todo-input"
            id={`edit-${task.id}`}
            onChange={(event) => setDraftTitle(event.target.value)}
            value={draftTitle}
            autoFocus
          />
          <div className="edit-form-row">
            <button className="button button-primary" type="submit">
              Save
            </button>
            <button
              className="button"
              onClick={() => {
                setDraftTitle(task.title);
                setEditError(null);
                setIsEditing(false);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
          <p aria-live="polite" className="validation-message">
            {editError ?? ""}
          </p>
        </form>
      </li>
    );
  }

  return (
    <li className="todo-item">
      <div className="todo-item-main">
        <input
          aria-label={`Toggle completion for ${task.title}`}
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          type="checkbox"
        />
        <div>
          <p className={`todo-item-title${task.completed ? " completed" : ""}`}>
            {task.title}
          </p>
          <p className="todo-item-meta">
            Created: {formatDate(task.createdAt)}
            {task.updatedAt ? ` • Updated: ${formatDate(task.updatedAt)}` : ""}
          </p>
        </div>
      </div>
      <div className="todo-item-actions">
        <button
          aria-label={`Edit ${task.title}`}
          className="button"
          onClick={() => {
            setDraftTitle(task.title);
            setEditError(null);
            setIsEditing(true);
          }}
          type="button"
        >
          Edit
        </button>
        <button
          aria-label={`Delete ${task.title}`}
          className="button button-danger"
          onClick={() => onDelete(task.id)}
          type="button"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
