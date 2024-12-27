import { useNavigate } from "react-router-dom";
import TaskForm from "../TaskForm";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function CreateTask() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Create New Task";
  },);

  return (
    <TaskForm onSubmit={(newTask) => {
        fetch(`https://task-manager-api.glitch.me/tasks`, {
          method: "POST",
          body: JSON.stringify(newTask),
          headers: {
            "Content-type": "application/json",
          },
        }).then(() => {
          navigate(`/tasks/${newTask.id}`);
          toast.success("Task created successfully.");
        });
      }}
    />
  );
}
