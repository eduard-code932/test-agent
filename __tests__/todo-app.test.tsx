import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoApp } from "@/components/todo-app";

describe("TodoApp integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds a task and rejects empty submissions", async () => {
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
});
