import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {Lock, Mail, Eye, EyeOff, LogIn, AlertCircle} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Show success message from signup
  const [successMessage] = useState(
    location.state?.message || ""
  );
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  // const res = await apiFetch("/api/v1/projects/login", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     email: form.email,
  //     password: form.password,
  //   }),
  // });
  
    const res = await fetch(`${API_BASE_URL}/api/v1/projects/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify({
    email: form.email,
    password: form.password,
  }),
});

  setLoading(false);

  if (!res) {
    setError("Login failed. Please check your credentials.");
    return;
  }
  sessionStorage.setItem("access_token", res.data.access_token);
  sessionStorage.setItem("project", JSON.stringify(res.data.project));
  login(res.data.project, res.data.access_token);

  navigate("/dashboard");
};


return (
  <div className="min-h-screen flex items-center justify-center 
    bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 
    relative overflow-hidden p-4">

    {/* Background glow */}
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

    <div className="w-full max-w-md relative z-10">
      {/* Logo/Brand Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight 
          bg-gradient-to-r from-primary to-secondary 
          bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-base-content/60 mt-2">
          Sign in to continue to your account
        </p>
      </div>

      {/* Card */}
      <div className="card w-full bg-base-100/80 backdrop-blur 
        shadow-xl border border-base-300/60 
        transition-transform duration-300 hover:scale-[1.01]">
        <div className="card-body p-9">

          {successMessage && (
            <div className="alert alert-success shadow-lg animate-[fadeIn_0.3s_ease-out]">
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error shadow-lg animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full pl-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label-text font-semibold flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="input input-bordered w-full pl-10 pr-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-base-content/40 hover:text-base-content/70" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/40 hover:text-base-content/70" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox checkbox-primary"
              />
              <span className="text-sm">Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                btn btn-lg w-full
                bg-gradient-to-r from-primary to-secondary
                border-none text-white font-semibold tracking-wide
                shadow-lg shadow-primary/30
                hover:shadow-xl hover:shadow-primary/40
                hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              {loading ? "Signing in..." : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          <div className="divider my-5">OR</div>

          <p className="text-center text-base-content/60">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="link link-primary font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center mt-8 text-sm opacity-70 hover:opacity-100 transition-opacity">
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  </div>
);

}