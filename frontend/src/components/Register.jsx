import { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import Github from "./GithubIcon";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/user-api/register", { username, email, password });
      alert("Account created successfully! You can now log in.");
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.message || 
                       "Registration failed. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/95 p-8 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <Github className="h-10 w-10 object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Create an account</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-[var(--text-secondary)]" />
              <input
                type="text"
                required
                className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-10 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-[var(--text-secondary)]" />
              <input
                type="email"
                required
                className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-10 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-[var(--text-secondary)]" />
              <input
                type="password"
                required
                className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-10 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
          <Github className="h-3 w-3" />
          <span>Secured by Secure-Auth</span>
        </div>
      </div>
    </div>
  );
}