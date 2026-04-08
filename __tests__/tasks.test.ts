import {
  Task,
  createTask,
  getFilteredTasks,
  initialTodoState,
  todoReducer,
  validateTaskTitle,
} from "@/lib/tasks";

function seedTasks(): Task[] {
  return [
    { id: "1", title: "Active task", completed: false, createdAt: 1 },
    { id: "2", title: "Completed task", completed: true, createdAt: 2 },
  ];
}

describe("task operations", () => {
  it("add: appends exactly one new task with completed=false", () => {
    const initial = { ...initialTodoState, tasks: [] };
    const task = createTask("Buy milk", { id: "new-id", now: 100 });

    const next = todoReducer(initial, { type: "add", task });

    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0]).toEqual({
      id: "new-id",
      title: "Buy milk",
      completed: false,
      createdAt: 100,
    });
  });

  it("validate-empty: rejects whitespace-only titles", () => {
    const result = validateTaskTitle("   ");
    expect(result.error).toBe("Task title cannot be empty.");
  });

  it("toggle: flips completed state for selected task", () => {
    const initial = { ...initialTodoState, tasks: seedTasks() };
    const next = todoReducer(initial, {
      type: "toggle",
      id: "1",
      updatedAt: 200,
    });

    expect(next.tasks[0].completed).toBe(true);
    expect(next.tasks[0].updatedAt).toBe(200);
    expect(next.tasks[1].completed).toBe(true);
  });

  it("edit: updates title for selected task", () => {
    const initial = { ...initialTodoState, tasks: seedTasks() };
    const next = todoReducer(initial, {
      type: "update",
      id: "1",
      title: "Updated title",
      updatedAt: 300,
    });

    expect(next.tasks[0].title).toBe("Updated title");
    expect(next.tasks[0].updatedAt).toBe(300);
  });

  it("delete: removes task by id", () => {
    const initial = { ...initialTodoState, tasks: seedTasks() };
    const next = todoReducer(initial, { type: "delete", id: "2" });

    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0].id).toBe("1");
  });

  it("filter: returns only matching tasks", () => {
    const tasks = seedTasks();
    expect(getFilteredTasks(tasks, "all")).toHaveLength(2);
    expect(getFilteredTasks(tasks, "active").map((task) => task.id)).toEqual([
      "1",
    ]);
    expect(
      getFilteredTasks(tasks, "completed").map((task) => task.id),
    ).toEqual(["2"]);
  });

  it("clear-completed: removes all completed tasks", () => {
    const initial = { ...initialTodoState, tasks: seedTasks() };
    const next = todoReducer(initial, { type: "clearCompleted" });

    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0].completed).toBe(false);
  });
});
