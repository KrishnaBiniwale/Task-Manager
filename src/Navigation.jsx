import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-primary shadow-sm mb-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand text-white fs-4">
          My Tasks
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/create" className="nav-link text-white px-3">
                Create a task
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
