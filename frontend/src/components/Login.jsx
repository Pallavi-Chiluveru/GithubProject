import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Github from "./GithubIcon";
import { defaultAppearance, useTheme } from "../theme/ThemeContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAppearance } = useTheme();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const completeLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.payload));
    setAppearance(data.payload.appearance || defaultAppearance);
    navigate("/dashboard");
  };

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    try {
      const res = await API.post("/user-api/google", { credential: response.credential });
      completeLogin(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error ||
                       err.response?.data?.message ||
                       "Google sign-in failed. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    window.handleGoogleSignIn = handleGoogleCredential;

    const initializeGoogleButton = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: window.handleGoogleSignIn,
      });

      const buttonContainer = document.getElementById("google-signin-button");
      if (buttonContainer) {
        buttonContainer.innerHTML = "";
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: "outline",
          size: "large",
          width: buttonContainer.offsetWidth || 320,
          text: "signin_with",
          shape: "rectangular",
        });
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
    } else {
      const existingScript = document.querySelector("script[src='https://accounts.google.com/gsi/client']");
      const script = existingScript || document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleButton;
      if (!existingScript) document.body.appendChild(script);
    }

    return () => {
      delete window.handleGoogleSignIn;
    };
  }, [googleClientId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/user-api/login", { email, password });
      completeLogin(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.message || 
                       "Login failed. Please check your credentials.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Dynamic Lighting Background */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse transition-all duration-1000" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse transition-all duration-1000" style={{ animationDuration: '7s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/[0.03] blur-[160px] rounded-full pointer-events-none" />
      
      {/* Modern Grid Lighting Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/95 p-8 backdrop-blur-xl relative z-10 shadow-2xl text-[var(--text-primary)]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <Github className="h-10 w-10 object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create one for free
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
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
            className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border-color)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">or</span>
            <div className="h-px flex-1 bg-[var(--border-color)]" />
          </div>

          {googleClientId ? (
            <div id="google-signin-button" className="flex min-h-[44px] w-full justify-center" />
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] opacity-70"
            >
              <span className="text-base font-bold">G</span>
              Google sign-in needs a client ID
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
