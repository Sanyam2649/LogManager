const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

function getToken() {
  return sessionStorage.getItem("access_token");
}

async function apiFetch(path, options = {}) {
  try {
    const token = getToken();

    let url = `${API_BASE_URL}${path}`;

    // ✅ REQUIRED: support query params
    if (options.params) {
      const query = new URLSearchParams(options.params).toString();
      if (query) {
        url += path.includes("?") ? `&${query}` : `?${query}`;
      }
    }

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        sessionStorage.removeItem("access_token");
      }
      try {
        return await response.json();
      } catch {
        return {
          status: false,
          message: `HTTP Error: ${response.status} ${response.statusText}`,
        };
      }
    }

    return await response.json();
  } catch (err) {
    return {
      status: false,
      message: "Network or server error",
      error: err.message,
    };
  }
}

export default apiFetch;
