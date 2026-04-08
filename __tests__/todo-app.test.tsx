import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoApp } from "@/components/todo-app";

describe("TodoApp integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds tasks with expected defaults and rejects empty submissions", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(screen.getByText("Task title cannot be empty.")).toBeInTheDocument();

    const input = screen.getByLabelText(/add a task/i);
    await user.type(input, "Write tests");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(screen.getByText("Write tests")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    await user.type(input, "Ship feature");
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);

    const stored = window.localStorage.getItem("todo-next-app.tasks");
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored ?? "[]") as Array<{
      id: string;
      title: string;
      completed: boolean;
    }>;

    expect(parsed).toHaveLength(2);
    expect(parsed[0].completed).toBe(false);
    expect(parsed[1].completed).toBe(false);
    expect(parsed[0].id).toEqual(expect.any(String));
    expect(parsed[1].id).toEqual(expect.any(String));
    expect(parsed[0].id).not.toBe(parsed[1].id);
  });

  it("toggles, edits, deletes, filters, and clears completed tasks", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByLabelText(/add a task/i);

    await user.type(input, "Task A");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    await user.type(input, "Task B");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    const taskARow = screen.getByText("Task A").closest("li");
    if (!taskARow) {
      throw new Error("Task A row not found.");
    }

    const toggleTaskA = within(taskARow).getByRole("checkbox");
    await user.click(toggleTaskA);
    expect(toggleTaskA).toBeChecked();

    await user.click(within(taskARow).getByRole("button", { name: /edit task a/i }));
    const editInput = within(taskARow).getByRole("textbox");
    await user.clear(editInput);
    await user.type(editInput, "Task A updated");
    await user.click(within(taskARow).getByRole("button", { name: /save/i }));
    expect(screen.getByText("Task A updated")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^completed$/i }));
    expect(screen.getByText("Task A updated")).toBeInTheDocument();
    expect(screen.queryByText("Task B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^active$/i }));
    expect(screen.getByText("Task B")).toBeInTheDocument();
    expect(screen.queryByText("Task A updated")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^all$/i }));
    await user.click(screen.getByRole("button", { name: /clear completed/i }));

    expect(screen.queryByText("Task A updated")).not.toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();

    const taskBRow = screen.getByText("Task B").closest("li");
    if (!taskBRow) {
      throw new Error("Task B row not found.");
    }

    await user.click(
      within(taskBRow).getByRole("button", { name: /delete task b/i }),
    );
    expect(screen.queryByText("Task B")).not.toBeInTheDocument();
  });

  it("restores tasks from persistence on remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TodoApp />);

    const input = screen.getByLabelText(/add a task/i);
    await user.type(input, "Persist me");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByText("Persist me")).toBeInTheDocument();
    });

    unmount();
    render(<TodoApp />);

    await waitFor(() => {
      expect(screen.getByText("Persist me")).toBeInTheDocument();
    });
  });

  it("keeps functioning if localStorage throws", async () => {
    const user = userEvent.setup();
    const getItemSpy = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("Storage unavailable");
      });
    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Storage unavailable");
      });

    render(<TodoApp />);

    const input = screen.getByLabelText(/add a task/i);
    await user.type(input, "In-memory task");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(screen.getByText("In-memory task")).toBeInTheDocument();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it("supports keyboard-only interaction across controls", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByLabelText(/add a task/i);
    input.focus();
    await user.type(input, "Keyboard Task A{Enter}");
    await user.type(input, "Keyboard Task B{Enter}");

    const taskARow = screen.getByText("Keyboard Task A").closest("li");
    if (!taskARow) {
      throw new Error("Keyboard Task A row not found.");
    }

    const taskACheckbox = within(taskARow).getByRole("checkbox");
    taskACheckbox.focus();
    await user.keyboard("[Space]");
    expect(taskACheckbox).toBeChecked();

    const completedFilter = screen.getByRole("button", { name: /^completed$/i });
    completedFilter.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Keyboard Task A")).toBeInTheDocument();
    expect(screen.queryByText("Keyboard Task B")).not.toBeInTheDocument();

    const activeFilter = screen.getByRole("button", { name: /^active$/i });
    activeFilter.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Keyboard Task B")).toBeInTheDocument();
    expect(screen.queryByText("Keyboard Task A")).not.toBeInTheDocument();

    const allFilter = screen.getByRole("button", { name: /^all$/i });
    allFilter.focus();
    await user.keyboard("{Enter}");

    const taskBRow = screen.getByText("Keyboard Task B").closest("li");
    if (!taskBRow) {
      throw new Error("Keyboard Task B row not found.");
    }

    const editTaskB = within(taskBRow).getByRole("button", {
      name: /edit keyboard task b/i,
    });
    editTaskB.focus();
    await user.keyboard("{Enter}");

    const editInput = within(taskBRow).getByRole("textbox");
    expect(editInput).toHaveFocus();
    await user.keyboard("{Control>}a{/Control}Keyboard Task B Updated{Enter}");
    expect(screen.getByText("Keyboard Task B Updated")).toBeInTheDocument();

    const updatedTaskBRow = screen.getByText("Keyboard Task B Updated").closest("li");
    if (!updatedTaskBRow) {
      throw new Error("Updated Keyboard Task B row not found.");
    }

    const deleteTaskB = within(updatedTaskBRow).getByRole("button", {
      name: /delete keyboard task b updated/i,
    });
    deleteTaskB.focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByText("Keyboard Task B Updated")).not.toBeInTheDocument();

    const clearCompleted = screen.getByRole("button", { name: /clear completed/i });
    clearCompleted.focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByText("Keyboard Task A")).not.toBeInTheDocument();
  });
});
