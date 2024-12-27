import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faThumbtack as faThumbtackOutline } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";

export default function Task() {
  let task = useLoaderData();
  task = Array.isArray(task) ? task[0] : task;
  const navigate = useNavigate();
  const [pinId, setPinId] = useState(task.pin && task.pin.id);
  const [pinDate, setPinDate] = useState(task.pin && task.pin.date)
  useEffect(() => {
    document.title = `${task.title} - Task Management`;
  }, [task.title]);

  return (
    <div className="card d-flex flex-column justify-content-center align-items-center shadow-lg rounded-3 border p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card-body d-flex flex-column align-items-center text-center">
        <h5 className="card-title mb-3">
          <button 
            type="button" 
            className="btn btn-link p-0" 
            aria-label={pinId ? "Unpin task" : "Pin task"} 
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title={pinId && pinDate ? `Pinned on: ${new Date(pinDate).toLocaleDateString()}` : ""}
            onClick={() => {
              if (pinId) {
                fetch('https://task-manager-api.glitch.me/pins')
                  .then(response => response.json())
                  .then(pins => {
                    const pinToDelete = pins.find(pin => pin.id === pinId);
                    if (pinToDelete) {
                    fetch(`https://task-manager-api.glitch.me/tasks/${task.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pinId: null }),
                    });
                  }
                    setPinId(null);
                    setPinDate(null);
                  });
              } else {
                fetch('https://task-manager-api.glitch.me/pins')
                .then(response => response.json())
                .then(pins => {
                  const newPinnedDate = new Date().toISOString().split('T')[0];
                  const existingPin = pins.find(pin => pin.pinDate === newPinnedDate);

                  if (existingPin) {
                    fetch(`https://task-manager-api.glitch.me/tasks/${task.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ pinId: existingPin.id }),
                    }).then(() => {
                      setPinId(existingPin.id);
                      setPinDate(newPinnedDate);
                    });
                  } else {
                    const newPinId = pins.length > 0 ? pins[pins.length - 1].id + 1 : 1;
                    fetch('https://task-manager-api.glitch.me/pins', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: newPinId,
                        pinDate: newPinnedDate,
                      }),
                    }).then(() => {
                      fetch(`https://task-manager-api.glitch.me/tasks/${task.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pinId: newPinId }),
                      }).then(() => {
                        setPinId(newPinId);
                        setPinDate(newPinnedDate);
                      });
                    });
                  }
                });

              }
          }}

          >
            <FontAwesomeIcon 
              icon={pinId ? faThumbtack : faThumbtackOutline} 
              color={pinId ? "red" : "gray"} 
              className="me-2" 
            />
          </button>
          {task.title}
        </h5>

        <p className="card-subtitle mb-3 text-muted">
          <strong>Priority:</strong> 
          <button
            className={`btn btn-sm ms-2 ${task.priority ? (task.priority.label === "low" ? "btn-success" : task.priority.label === "medium" ? "btn-warning" : "btn-danger") : "btn-danger"}`}
            style={{ pointerEvents: "none", cursor: "default" }}
          >
            {task.priority.label[0].toUpperCase() + task.priority.label.slice(1)}
          </button>
        </p>

        <h6 className="card-subtitle mb-3 text-muted">
          <strong>Due By:</strong> {task.deadline}
        </h6>

        <p className="mb-3">{task.description}</p>

        <div className="">
          <h6>Status:</h6>
          {task.status.label === "completed" ? (
            <p className="text-success">Completed</p>
          ) : (
            <p className="text-warning">In Progress</p>
          )}
        </div>

        <div className="mb-4">
          <h6 className="mt-3">Tags:</h6>
          <ul className="list-unstyled d-flex flex-wrap">
            {task.tags.length === 0 ? (
              <p className="mb-0">None</p>
            ) : (
              task.tags.map((tag) => (
                <li key={tag.id} className="badge bg-secondary me-2 mb-2">
                  {tag.label}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="d-flex justify-content-between gap-3 w-100">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              const isDeleteConfirmed = window.confirm(
                "Are you sure you want to delete this task?"
              );
                
              if (isDeleteConfirmed) {
                fetch(`https://task-manager-api.glitch.me/tasks/${task.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ pinId: -1 }),
                })
                  .then(() => {
                    fetch(`https://task-manager-api.glitch.me/tasks/${task.id}`, {
                      method: "DELETE",
                    })
                      .then(()=>{
                        navigate("/");
                        toast.success("Your task was successfully deleted.");
                      })
                  });
              }

            }}
          >
            Delete
          </button>

          <Link to={`/tasks/${task.id}/edit`} className="btn btn-primary">
            Edit Task
          </Link>
        </div>
      </div>
    </div>
  );
}
