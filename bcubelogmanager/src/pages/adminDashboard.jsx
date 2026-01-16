import { useEffect, useRef, useState } from "react";
import { Trash2, Eye, CheckCircle, XCircle, X } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";

function getAdminToken() {
  return sessionStorage.getItem("admin_access_token");
}

async function adminFetch(path, options = {}) {
  const token = getAdminToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

async function getProject(id) {
  return adminFetch(`/api/v1/admin/projects/${id}`);
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const didFetch = useRef(false);

  // --- Load all projects ---
  async function loadProjects() {
    setLoading(true);
    try {
      const data = await adminFetch("/api/v1/admin/projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load projects");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    loadProjects();
  }, []);

  // --- Toggle allow/disallow ---
  async function toggleAllow(project) {
    setActionId(project.id);
    try {
      const endpoint = project.isAllowed
        ? `/api/v1/admin/projects/${project.id}/disallow`
        : `/api/v1/admin/projects/${project.id}/allow`;

      await adminFetch(endpoint, { method: "POST" });
      await loadProjects();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
    setActionId(null);
  }

  // --- View single project in modal ---
  async function viewProject(id) {
    setActionId(id);
    try {
      const project = await getProject(id);
      setSelectedProject(project);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch project details");
    }
    setActionId(null);
  }

  // --- Filter & sort projects ---
  const filteredProjects = projects
    .filter(
      (p) =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.email.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortAsc ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="opacity-70">Manage all registered projects</p>
      </div>
      
        <button
    className="btn btn-sm btn-error"
    onClick={() => {
      sessionStorage.removeItem("admin_access_token");
      window.location.href = "/login"; // redirect to admin login
    }}
  >
    Logout
  </button>

      {/* Filter + Sort */}
      <div className="flex justify-between items-center p-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input input-bordered w-1/3"
        />

        <div className="space-x-2">
          <button
            className="btn btn-sm"
            onClick={() => {
              setSortField("id");
              setSortAsc(sortField === "id" ? !sortAsc : true);
            }}
          >
            Sort by ID {sortField === "id" ? (sortAsc ? "↑" : "↓") : ""}
          </button>

          <button
            className="btn btn-sm"
            onClick={() => {
              setSortField("name");
              setSortAsc(sortField === "name" ? !sortAsc : true);
            }}
          >
            Sort by Name {sortField === "name" ? (sortAsc ? "↑" : "↓") : ""}
          </button>
        </div>
      </div>

      {/* Project Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center p-10">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td className="font-medium">{p.name}</td>
                      <td>{p.username}</td>
                      <td>{p.email}</td>
                      <td>
                        {p.isAllowed ? (
                          <span className="badge badge-success gap-1">
                            <CheckCircle className="w-4 h-4" /> Allowed
                          </span>
                        ) : (
                          <span className="badge badge-error gap-1">
                            <XCircle className="w-4 h-4" /> Blocked
                          </span>
                        )}
                      </td>
                      <td className="text-right space-x-2">
                        <button
                          className="btn btn-sm btn-outline"
                          title="View"
                          disabled={actionId === p.id}
                          onClick={() => viewProject(p.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          className={`btn btn-sm ${
                            p.isAllowed ? "btn-warning" : "btn-success"
                          }`}
                          disabled={actionId === p.id}
                          onClick={() => toggleAllow(p)}
                        >
                          {p.isAllowed ? "Disallow" : "Allow"}
                        </button>

                        {/* Delete button commented */}
                        {/* <button
                          className="btn btn-sm btn-error"
                          disabled={actionId === p.id}
                          onClick={() => deleteProject(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedProject && (
<div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-auto shadow-xl">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">Project Details</h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p>
                <strong>ID:</strong> {selectedProject.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedProject.name}
              </p>
              <p>
                <strong>Username:</strong> {selectedProject.username}
              </p>
              <p>
                <strong>Email:</strong> {selectedProject.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedProject.phone}
              </p>
              <p>
                <strong>API Key:</strong> {selectedProject.api_key}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedProject.isAllowed ? "Allowed" : "Blocked"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedProject.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                className="btn btn-sm"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
