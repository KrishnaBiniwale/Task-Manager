import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskForm from "./TaskForm";
import TaskCard from "./TaskCard";
import { toast } from "react-toastify";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";

let createdTask = {
  id: 6,
  title: "Test Title",
  description: "Test Description",
  priority: {
    id: 1,
    label: "low",
  },
  deadline: "2024-01-01",
  status: {
    id: 1,
    label: "in-progress",
  },
  userId: 1,
  tags: [1, 2],
  pin: null,
};

test("basic task card", () => {
  render(
    <Router>
      <TaskCard task={createdTask} />
    </Router>
  );

  expect(screen.getByText(createdTask.title)).toBeInTheDocument();
  expect(
    screen.getByText("Due By: " + createdTask.deadline)
  ).toBeInTheDocument();
  expect(document.title).toBe(createdTask.title + " - Task Management");
});

test("render pinned", () => {
  createdTask.pinId = 1;
  createdTask.pin = { id: 1, pinDate: "2024-11-10" };

  render(
    <Router>
      <TaskCard task={createdTask} />
    </Router>
  );

  const pinnedIcon = screen.getByTestId("task-pin-icon");
  expect(pinnedIcon).toHaveAttribute("data-icon", "thumbtack");
  expect(pinnedIcon).toHaveAttribute("color", "red");
});

test("priority labels", () => {
  createdTask.priority = { id: 2, label: "medium" };
  render(
    <Router>
      <TaskCard task={createdTask} />
    </Router>
  );

  const priorityLabel = screen.getByTestId("priority-label");
  expect(priorityLabel).toHaveTextContent("Medium");
  expect(priorityLabel).toHaveClass("btn-warning");
});

test("no tags", () => {
  createdTask.tags = [];
  render(
    <Router>
      <TaskCard task={createdTask} />
    </Router>
  );

  const tagsText = screen.getByTestId("tags");
  expect(tagsText).toHaveTextContent("No tags");
});

test("details link", () => {
  createdTask.id = 4;
  render(
    <Router>
      <TaskCard task={createdTask} />
    </Router>
  );

  const detailsLink = screen.getByTestId("details-link");
  expect(detailsLink).toHaveAttribute("href", `/tasks/${createdTask.id}`);
});

test("task form tags", () => {
  createdTask.tags = [
    {
      id: 1,
      label: "Travel",
    },
    {
      id: 2,
      label: "School",
    },
  ];
  render(
    <Router>
      <TaskForm task={createdTask} />
    </Router>
  );

  createdTask.tags.forEach((tag) => {
    expect(screen.getByTestId(`tag-${tag.id}`)).toHaveTextContent(tag.label);
  });
});

test("renders initial form with task data", () => {
  render(
    <Router>
      <TaskForm task={createdTask} onSubmit={jest.fn()} />
    </Router>
  );

  expect(screen.getByLabelText("Title")).toHaveValue(createdTask.title);
  expect(screen.getByLabelText("Write any description here")).toHaveValue(
    createdTask.description
  );
  expect(screen.getByLabelText("Medium")).toBeChecked();
  expect(screen.getByLabelText("Deadline")).toHaveValue(createdTask.deadline);
});

test("delete a tag", () => {
  createdTask.tags = [{ id: 1, label: "Travel" }];
  render(
    <Router>
      <TaskForm task={createdTask} onSubmit={jest.fn()} />
    </Router>
  );

  const deleteIcon = screen.getByTestId("tag-1-delete");
  fireEvent.click(deleteIcon);
  expect(screen.queryByTestId("tag-1")).toBeNull();
});

test("form validation - missing title", () => {
  const handleSubmit = jest.fn();

  render(
    <Router>
      <TaskForm task={createdTask} onSubmit={handleSubmit} />
    </Router>
  );

  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "" } });
  fireEvent.click(screen.getByText("Save"));

  expect(handleSubmit).not.toHaveBeenCalled();
});

test("add a tag and check if it renders", () => {
  render(
    <Router>
      <TaskForm task={createdTask} onSubmit={jest.fn()} />
    </Router>
  );

  const tagInput = screen.getByPlaceholderText("Add Tag");
  fireEvent.change(tagInput, { target: { value: "Travel" } });
  fireEvent.keyDown(tagInput, { key: "Enter" });

  expect(screen.getByTestId("tag-1")).toHaveTextContent("Travel");
});

test("submit form", () => {
  const handleSubmit = jest.fn();

  render(
    <Router>
      <TaskForm task={createdTask} onSubmit={handleSubmit} />
    </Router>
  );

  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Updated Title" },
  });
  fireEvent.change(screen.getByLabelText("Write any description here"), {
    target: { value: "Updated Description" },
  });

  fireEvent.click(screen.getByText("Save"));

  expect(handleSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Updated Title",
      description: "Updated Description",
    })
  );
});
