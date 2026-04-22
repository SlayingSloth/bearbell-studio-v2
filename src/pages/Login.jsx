import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../lib/firebase/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password, { rememberMe });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream font-body text-navy">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 p-8 bg-white border border-ice rounded"
      >
        <h1 className="text-2xl font-display tracking-wide">Inloggen</h1>

        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="border border-ice rounded px-3 py-2 bg-cream text-navy focus:outline-none focus:border-navy"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Wachtwoord
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="border border-ice rounded px-3 py-2 bg-cream text-navy focus:outline-none focus:border-navy"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Onthoud mij
        </label>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-orange text-cream rounded py-2 font-body font-semibold disabled:opacity-60"
        >
          {submitting ? "Bezig..." : "Inloggen"}
        </button>

        <p className="text-sm text-center">
          Nog geen account?{" "}
          <Link to="/signup" className="text-orange underline">
            Registreren
          </Link>
        </p>
      </form>
    </div>
  );
}
