import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack, faThumbtack as faThumbtackOutline } from '@fortawesome/free-solid-svg-icons';

export default function TaskCard(props) {
const [pinId, setPinId] = useState(props.task.pinId ? props.task.pin.id : 0);
const [pinDate, setPinDate] = useState(props.task.pinId ? props.task.pin.pinDate : null);

const togglePinned = () => {
  const newPinnedState = pinId ? false : true;
  const newPinnedDate = newPinnedState ? new Date().toISOString().split('T')[0] : null;
  setPinDate(newPinnedDate);

  if (newPinnedState) {
    fetch('/pins')
      .then(response => response.json())
      .then(pins => {
        const existingPin = pins.find(pin => pin.pinDate === newPinnedDate);

        if (existingPin) {
          fetch(`/tasks/${props.task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pinId: existingPin.id }),
          }).then(() => {
            setPinId(existingPin.id);
            setPinDate(newPinnedDate);
          });
        } else {
          const newPinId = pins.length > 0 ? pins[pins.length - 1].id + 1 : 1;
          fetch('/pins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: newPinId,
              pinDate: newPinnedDate,
            }),
          }).then(() => {
            fetch(`/tasks/${props.task.id}`, {
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
  } else {
    fetch(`/tasks/${props.task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinId: 0 }),
    }).then(() => {
      setPinId(0);
      setPinDate(null);
    });
  }
};

  useEffect(() => {
    document.title = `${props.task.title} - Task Management`;
  }, [props.task.title]);

  return (
    <div className="card d-flex flex-column justify-content-center align-items-center">
      <div className="card-body d-flex flex-column align-items-center text-center">
        <h5 className="card-title mb-3">
          <button 
            type="button" 
            className="btn btn-link p-0" 
            onClick={togglePinned} 
            aria-label={pinId ? "Unpin task" : "Pin task"} 
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
            title={pinDate ? `Pinned on: ${new Date(pinDate).toLocaleDateString()}` : ""}
          >
            <FontAwesomeIcon 
              data-testid="task-pin-icon"
              icon={pinId ? faThumbtack : faThumbtackOutline} 
              color={pinId ? "red" : "gray"} 
              className="me-2" 
            />
          </button>
          {props.task.title}
        </h5>

        <p className="card-subtitle mb-3 text-muted">Priority: 
          <button
            data-testid="priority-label"
            className={`btn btn-sm ms-2 ${props.task.priority.label === "low" ? "btn-success" : props.task.priority.label === "medium" ? "btn-warning" : "btn-danger"}`}
            style={{ pointerEvents: "none", cursor: "default" }}
          >
            {props.task.priority.label[0].toUpperCase() + props.task.priority.label.slice(1)}
          </button>
        </p>

        <h6 className="card-subtitle mb-3 text-muted">
          Due By: {props.task.deadline}
        </h6>

        <div className="">
          <h6>Status:</h6>
          {props.task.status.label === "completed" ? (
            <p className="text-success">Completed</p>
          ) : (
            <p className="text-warning">In Progress</p>
          )}
        </div>

        <div className="tags">
          <h6 className="card-subtitle mb-2 text-muted">Tags:</h6>
          <ul className="list-unstyled d-flex flex-wrap">
            {props.task.tags.length === 0 ? (
              <p className="mb-0" data-testid="tags">No tags</p>
            ) : (
              props.task.tags.map((tag, index) => (
                <li key={index} className="badge bg-secondary me-2 mb-2">
                  {tag.label}
                </li>
              ))
            )}
          </ul>
        </div>

        <Link to={`/tasks/${props.task.id}`} className="btn btn-primary btn-sm" data-testid="details-link">
          Click for Details
        </Link>
      </div>
    </div>
  );
}
