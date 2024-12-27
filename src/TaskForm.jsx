import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function TaskForm(props) {
  let task = Array.isArray(props.task) ? props.task[0] : props.task || "";
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description || "" : "");
  const [priority, setPriority] = useState(task ? task.priority.id : 2);
  const [deadline, setDeadline] = useState(task ? task.deadline : "");
  const [status, setStatus] = useState(task ? task.status.id : 2);
  const [tags, setTags] = useState(task ? task.tags : []);
  const [newTag, setNewTag] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const timeoutRef = useRef(undefined);

  const handleDeleteTag = (tagId) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };

  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();

        if (!title) {
          toast.error("A task requires a title");
          return;
        }

        if (!task.id) {
          fetch("/tasks")
            .then((response) => response.json())
            .then((tasks) => {
              const lastTaskId = tasks[tasks.length - 1].id;
              let createdTask = {
                id: lastTaskId + 1,
                title,
                description,
                priorityId: priority,
                deadline,
                statusId: status,
                tags: tags.map(tag => tag.id),
                pinId: 0
              };
              props.onSubmit(createdTask);
            });
        } else {
          let createdTask = {
            id: task.id,
            title,
            description,
            priorityId: priority,
            deadline,
            statusId: status,
            tags: tags.map(tag => tag.id),
            pinId: task.pinId
          };
          props.onSubmit(createdTask);
        }
      }}
      className="p-4 shadow-lg rounded-3 border"
    >
      <div className="form-group form-floating mb-3">
        <input
          className="form-control p-2"
          type="text"
          name="title"
          placeholder="Title"
          id="title"
           style={{ height: "100px" }}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <label htmlFor="title">Title</label>
      </div>

      <div className="form-group form-floating mb-3">
        <textarea
            className="form-control"
            id="description"
            style={{ height: "100px" }}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
        />
        <label htmlFor="description">Write any description here</label>
      </div>


      <div className="form-group mb-3">
        <div className="d-flex gap-3">
          <div className="form-check">
            <input
              type="radio"
              id="priorityLow"
              name="priority"
              value="low"
              className="form-check-input"
              checked={priority === 3}
              onChange={() => setPriority(3)}
            />
            <label htmlFor="priorityLow" className="form-check-label">
              Low
            </label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              id="priorityMedium"
              name="priority"
              value="medium"
              className="form-check-input"
              checked={priority === 2}
              onChange={() => setPriority(2)}
            />
            <label htmlFor="priorityMedium" className="form-check-label">
              Medium
            </label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              id="priorityHigh"
              name="priority"
              value="high"
              className="form-check-input"
              checked={priority === 1}
              onChange={() => setPriority(1)}
            />
            <label htmlFor="priorityHigh" className="form-check-label">
              High
            </label>
          </div>
        </div>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="deadline" className="form-label">Deadline</label>
        <input
          type="date"
          className="form-control p-2"
          id="deadline"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
        />
      </div>

      <div className="form-group form-check mb-3">
        <label htmlFor="status" className="form-label">Has been completed</label>
        <input
          className="form-check-input"
          type="checkbox"
          id="status"
          checked={status === 1}
          onChange={(event) => { 
            if (status === 2) {
              setStatus(1);
            } else {
              setStatus(2);
            }
          }}
        />
      </div>

      <div className="form-group mb-3">
        <h4>Tags:</h4>
        <ul className="list-unstyled d-flex flex-wrap">
          {tags.map((tag) => (
            <li key={tag.id} className="d-inline-block me-2 mb-2">
              <span className="badge bg-secondary me-1" data-testid={`tag-${tag.id}`}>{tag.label}</span>
              <FontAwesomeIcon
                icon={faTimes}
                className="text-danger"
                style={{
                  fontSize: "1.2em",
                  cursor: "pointer",
                }}
                data-testid={`tag-${tag.id}-delete`}
                onClick={() => handleDeleteTag(tag.id)}
              />
            </li>
          ))}
        </ul>

        <div>
          <input
            className="form-control p-2"
            placeholder="Add Tag"
            list="tagsInDb"
            type="text"
            id="tag"
            name="tag"
            value={newTag}
            onChange={(event) => {
              const value = event.target.value;
              setNewTag(value);

              clearTimeout(timeoutRef.current);
              if (value) {
                timeoutRef.current = setTimeout(() => {
                  fetch(`/tags/?label_like=${value}`)
                    .then((response) => response.json())
                    .then((dbTags) => {
                      setSearchTags(dbTags);
                    });
                }, 250);
              } else {
                setSearchTags([]);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (newTag !== "" && tags.map(tag => tag.label).includes(newTag)) {
                  toast.error("That tag is already present.");
                } else if (newTag !== "") {
                  fetch("/tags")
                    .then((response) => response.json())
                    .then((dbTags) => {
                      let tagAlreadyInDb = false;
                      let dbTagIds = [];
                      dbTags.forEach((dbTag) => {
                        dbTagIds.push(dbTag.id);
                        if (dbTag.label === newTag && !tags.includes(dbTag)) {
                          setTags([...tags, dbTag]);
                          tagAlreadyInDb = true;
                        }
                      });
                      if (!tagAlreadyInDb) {
                        let newTagObject = {
                          id: dbTagIds[dbTagIds.length - 1] + 1,
                          label: newTag
                        };
                        fetch(`/tags`, {
                          method: "POST",
                          body: JSON.stringify(newTagObject),
                          headers: {
                            "Content-type": "application/json",
                          },
                        });
                        setTags([...tags, newTagObject]);
                      }
                    });
                  setNewTag("");
                }
              }
            }}
          />
          <datalist id="tagsInDb">
            {searchTags.map((searchTag) => {
              return <option key={searchTag.id} value={searchTag.label} />;
            })}
          </datalist>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-100 mt-3 p-2">
        Save
      </button>
    </form>
  );
}
