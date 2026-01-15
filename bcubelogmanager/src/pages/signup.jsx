// Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, Eye, EyeOff, 
  Check, AlertCircle, Loader2, Sparkles,
  Workflow,
  Phone
} from "lucide-react";
import apiFetch from "../service/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username:"",
    phone:"",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Check password strength
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  if (!agreedToTerms) {
    setError("You must agree to the terms and conditions");
    return;
  }

  setLoading(true);

  const res = await apiFetch("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify({
      name: form.name,
      username: form.username,  
      email: form.email,
      phone: form.phone,          
      password: form.password,
    }),
  });

  setLoading(false);

  if (!res) {
    setError(res?.message || "Signup failed. Please try again.");
    return;
  }

  navigate("/login", {
    state: { message: "Account created successfully! Please login." }
  });
};


  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return "bg-error";
      case 1: return "bg-error";
      case 2: return "bg-warning";
      case 3: return "bg-info";
      case 4: return "bg-success";
      default: return "bg-error";
    }
  };

  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center 
    bg-gradient-to-br from-secondary/10 via-base-100 to-primary/10 
    relative overflow-hidden p-4">

    {/* Background glow */}
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

    <div className="w-full max-w-md relative z-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight 
          bg-gradient-to-r from-secondary to-primary 
          bg-clip-text text-transparent">
          Join Us Today
        </h1>
        <p className="text-base-content/60 mt-2">
          Create your account to get started
        </p>
      </div>

      {/* Card */}
      <div className="card w-full bg-base-100/80 backdrop-blur
        shadow-xl border border-base-300/60
        transition-transform duration-300 hover:scale-[1.01]">
        <div className="card-body p-9">

          {error && (
            <div className="alert alert-error shadow-lg animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div className="form-control">
              <label className="label-text font-semibold flex items-center gap-2 mb-1">
                <User className="w-4 h-4" /> User Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="input input-bordered w-full pl-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="form-control">
              <label className="label-text font-semibold flex items-center gap-2 mb-1">
                <Workflow className="w-4 h-4" /> Project Name
              </label>
              <div className="relative">
                <briefcase-business className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="My project"
                  required
                  className="input input-bordered w-full pl-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label-text font-semibold flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="input input-bordered w-full pl-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
                />
              </div>
            </div>
            
        <div className="form-control">
              <label className="label-text font-semibold flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4" />Phone:
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9999999999"
                  required
                  className="input input-bordered w-full pl-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label-text font-semibold flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4" /> Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input input-bordered w-full pl-10 pr-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
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

              {/* Password strength */}
              {form.password && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Password Strength</span>
                    <span className={`font-semibold ${passwordStrength > 2 ? "text-success" : "text-warning"}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-base-300 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength * 25}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label-text font-semibold flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4" /> Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 pr-10
                    focus:outline-none focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-base-content/40 hover:text-base-content/70" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/40 hover:text-base-content/70" />
                  )}
                </button>
              </div>

              {form.confirmPassword && form.password === form.confirmPassword && (
                <div className="flex items-center gap-2 mt-2 text-success text-sm">
                  <Check className="w-4 h-4" /> Passwords match
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="checkbox checkbox-primary mt-1"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="link link-primary">Terms</Link> and{" "}
                <Link to="/privacy" className="link link-primary">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="
                btn btn-lg w-full
                bg-gradient-to-r from-secondary to-primary
                border-none text-white font-semibold tracking-wide
                shadow-lg shadow-primary/30
                hover:shadow-xl hover:shadow-primary/40
                hover:scale-[1.02]
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          <div className="divider my-5">OR</div>

          <p className="text-center text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);

}