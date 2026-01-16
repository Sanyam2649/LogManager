import { useEffect, useState } from "react";
import apiFetch from "../service/api";

export default function ProjectModal({ onClose }) {
  const projectId = JSON.parse(sessionStorage.getItem("project"))?.id;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      setLoading(true);
      const res = await apiFetch(`/api/v1/projects/${projectId}`);
      setProject(res);
      setLoading(false);
    })();
  }, [projectId]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);

    await apiFetch(`/api/v1/projects/${projectId}`, {
      method: "PUT",
      body: {
        name: project.name,
        username: project.username,
        email: project.email,
        phone: project.phone,
        isAllowed: project.isAllowed,
      },
    });

    setSaving(false);
  }

  async function handleDelete() {
    await apiFetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
    sessionStorage.clear();
    window.location.href = "/";
  }

  if (!projectId) return null;

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-2xl mb-6">Project Settings</h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-control">
              <label className="label">Project Name</label>
              <input
                className="input input-bordered"
                value={project.name}
                onChange={(e) => setProject({ ...project, name: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">Username</label>
              <input
                className="input input-bordered"
                value={project.username}
                onChange={(e) => setProject({ ...project, username: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">Email</label>
              <input
                type="email"
                className="input input-bordered"
                value={project.email}
                onChange={(e) => setProject({ ...project, email: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">Phone</label>
              <input
                className="input input-bordered"
                value={project.phone}
                onChange={(e) => setProject({ ...project, phone: e.target.value })}
              />
            </div>

            <div className="form-control md:col-span-2">
              <label className="label">API Key</label>
              <div className="flex gap-2">
                <input
                  className="input input-bordered w-full font-mono"
                  value={project.api_key}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigator.clipboard.writeText(project.api_key)}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="form-control md:col-span-2 flex-row items-center justify-between mt-2">
              <div>
                <p className="font-medium">Project Access</p>
                <p className="text-sm opacity-60">Allow this project to access APIs</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={project.isAllowed}
                disabled
              />
            </div>

            <div className="md:col-span-2 flex justify-between items-center mt-6">
              <button type="button" className="btn btn-error" onClick={handleDelete}>
                Delete Project
              </button>

              <div className="flex gap-2">
                <button type="button" className="btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}