import { useState, useRef } from "react";
import { useLoaderData } from "react-router-dom";
import TaskCard from "../TaskCard";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    document.title = "All Tasks";
  }, );
  const tasks = useLoaderData();
  const [showPinned, setShowPinned] = useState(false);
  const [showInProgress, setShowInProgress] = useState(false);
  const [sortOption, setSortOption] = useState("asc");
  const [searchTag, setSearchTag] = useState("");
  const [updatedSearchTag, setUpdatedSearchTag] = useState("");
  const timeoutRef = useRef(null);

  const filteredTasks = tasks.filter(task => {
    const isPinned = showPinned ? task.pinId !== 0 : true;
    const isInProgress = showInProgress ? task.status.label === "in-progress" : true;
    return isPinned && isInProgress;
  });

  const tasksFilteredByTag = updatedSearchTag
    ? filteredTasks.filter(task =>
        task.tags.some(tag => tag.label.toLowerCase().includes(updatedSearchTag.toLowerCase()))
      )
    : filteredTasks;

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedTasks = tasksFilteredByTag.sort((a, b) => {
    if (sortOption === "asc") {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortOption === "desc") {
      return new Date(b.deadline) - new Date(a.deadline);
    } else if (sortOption === "titleAsc") {
      return a.title.localeCompare(b.title);
    } else if (sortOption === "titleDesc") {
      return b.title.localeCompare(a.title);
    } else if (sortOption === "priorityAsc") {
      return priorityOrder[a.priority.label] - priorityOrder[b.priority.label];
    } else if (sortOption === "priorityDesc") {
      return priorityOrder[b.priority.label] - priorityOrder[a.priority.label];
    }

    return 0;
  });

  let groupedTasks = [];
  if (sortOption.startsWith("priority")) {
    groupedTasks = Object.entries(
      sortedTasks.reduce((groups, task) => {
        if (!groups[task.priority]) groups[task.priority] = [];
        groups[task.priority].push(task);
        return groups;
      }, {})
    ).sort((a, b) => priorityOrder[a[0]] - priorityOrder[b[0]]);
  } else {
    groupedTasks = [["all", sortedTasks]];
  }

  const rows = groupedTasks.flatMap(([priority, tasks]) => {
    const priorityRows = [];
    for (let i = 0; i < tasks.length; i += 4) {
      priorityRows.push(tasks.slice(i, i + 4));
    }
    return priorityRows;
  });

  return (
    <div className="index-page container mt-5">
      <h1 className="text-center mb-4 text-primary">My Tasks</h1>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="pinnedSwitch" 
            checked={showPinned} 
            onChange={() => setShowPinned(!showPinned)} 
          />
          <label className="form-check-label" htmlFor="pinnedSwitch">
            Show Only Pinned Tasks
          </label>
        </div>

        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="inProgressSwitch" 
            checked={showInProgress} 
            onChange={() => setShowInProgress(!showInProgress)} 
          />
          <label className="form-check-label" htmlFor="inProgressSwitch">
            Show Only In-Progress Tasks
          </label>
        </div>

        <div className="d-flex">
          <input 
            type="text" 
            className="form-control me-2" 
            placeholder="Search by Tag" 
            id="tagSearch"
            value={searchTag} 
            onChange={(event) => {
              const value = event.target.value;
              setSearchTag(value);
              clearTimeout(timeoutRef.current);
              timeoutRef.current = setTimeout(() => {
                setUpdatedSearchTag(value);
              }, 250);
            }} 
          />
        </div>

        <div>
          <label htmlFor="sortOrder" className="form-label me-2">Sort By</label>
          <select 
            id="sortOrder" 
            className="form-select" 
            value={sortOption} 
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="asc">Due Date (Ascending)</option>
            <option value="desc">Due Date (Descending)</option>
            <option value="titleAsc">Title (Ascending)</option>
            <option value="titleDesc">Title (Descending)</option>
            <option value="priorityAsc">Priority (High to Low)</option>
            <option value="priorityDesc">Priority (Low to High)</option>
          </select>
        </div>
      </div>

      {rows.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className="row"
          style={{
            backgroundColor: rowIndex % 2 === 0 ? "#d6d8db" : "#b0b3b8",
            padding: "10px 0",
          }}
        >
          {row.map(task => (
            <div key={task.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
