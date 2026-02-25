import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { isTokenAdmin } from "../utils/auth";

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await login({ email, password });
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      console.log("Login successful, token stored in localStorage.", response);
      if (isTokenAdmin(response.accessToken)) {
        navigate("/admin");
      } else {
        navigate("/worker");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to log in right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-teal-200/50 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-teal-900/10 bg-white/90 shadow-[0_20px_80px_-40px_rgba(2,44,34,0.65)] backdrop-blur-sm md:grid-cols-[1.15fr_1fr]">
          <div className="hidden border-r border-teal-900/10 bg-gradient-to-br from-teal-900 to-emerald-800 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-teal-100">
                MomsApp
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight">
                A calmer day starts here.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-teal-50/90">
                Check assignments, coordinate schedules, and keep your household
                moving with less friction.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-teal-100/85">
              Daily planning dashboard
            </p>
          </div>

          <div className="p-7 sm:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-700">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              Log in to MomsApp
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Use your account credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300/90 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300/90 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-700 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <Link
                to="/worker"
                className="font-semibold text-teal-700 decoration-2 underline-offset-2 hover:underline"
              >
                Continue to worker dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
