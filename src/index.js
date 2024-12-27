import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.min.css";

import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./routes/Index";
import Root from "./routes/Root";
import CreateTask from "./routes/CreateTask";
import Task from "./routes/Task";
import EditTask from "./routes/EditTask";

function fetchTags(tasks, multipleTasks) {
  return Promise.all([
    fetch("https://task-manager-api.glitch.me/tags").then((response) =>
      response.json()
    ),
    fetch("https://task-manager-api.glitch.me/priorities").then((response) =>
      response.json()
    ),
    fetch("https://task-manager-api.glitch.me/statuses").then((response) =>
      response.json()
    ),
    fetch("https://task-manager-api.glitch.me/pins").then((response) =>
      response.json()
    ),
  ]).then(([tags, priorities, statuses, pins]) => {
    tasks = Array.isArray(tasks) ? tasks : [tasks];
    tasks.forEach((task) => {
      task.tags = task.tags.map((tagId) =>
        tags.find((tag) => tag.id === tagId)
      );
      task.priority = priorities.find(
        (priority) => priority.id === task.priorityId
      );
      task.status = statuses.find((status) => status.id === task.statusId);
      if (task.pinId) {
        task.pin = pins.find((pin) => pin.id === task.pinId);
      }
    });
    //console.log(tasks);
    return tasks;
  });
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Index />,
        loader() {
          return fetch("https://task-manager-api.glitch.me/tasks")
            .then((response) => {
              return response.json();
            })
            .then((tasks) => {
              return fetchTags(tasks, true);
            });
        },
      },
      {
        path: "/tasks/:taskId",
        loader({ params }) {
          return fetch(`/tasks/${params.taskId}`)
            .then((response) => response.json())
            .then((task) => {
              return fetchTags(task, false);
            });
        },
        element: <Task />,
      },
      {
        path: "/create",
        element: <CreateTask />,
      },
      {
        path: "/tasks/:taskId/edit",
        loader({ params }) {
          return fetch(`/tasks/${params.taskId}`)
            .then((response) => response.json())
            .then((task) => {
              return fetchTags(task, true);
            });
        },
        element: <EditTask />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
