import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TaskForm from "../TaskForm";
import { useEffect } from "react";

export default function EditTask() {
  const task = useLoaderData();
  useEffect(() => {
    document.title = `${task[0].title} - Edit Task`;
  }, [task]);
  const navigate = useNavigate();

  return (
    <TaskForm
      task={task}
      onSubmit={(updatedTask) => {
        fetch(`https://task-manager-api.glitch.me/tasks/${updatedTask.id}`, {
          method: "PATCH",
          body: JSON.stringify(updatedTask),
          headers: {
            "Content-type": "application/json",
          },
        }).then(() => {
          navigate(`https://task-manager-api.glitch.me/tasks/${updatedTask.id}`);
          toast.success("Task edited successfully.");
        });
      }}
    />
  );
}
