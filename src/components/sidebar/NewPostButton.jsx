import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { POST_FORMATS } from "../../lib/brand/tokens";
import { usePosts } from "../../hooks/usePosts";

const DEFAULT_FORMAT = "carousel";

export function NewPostButton() {
  const navigate = useNavigate();
  const { uid, createAndNavigate } = usePosts();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState(DEFAULT_FORMAT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    if (submitting) return;
    setOpen(false);
    setTitle("");
    setFormat(DEFAULT_FORMAT);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!uid || !title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createAndNavigate(uid, { title: title.trim(), format }, navigate);
      setOpen(false);
      setTitle("");
      setFormat(DEFAULT_FORMAT);
    } catch (err) {
      setError(err?.message || "Aanmaken mislukt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-orange text-cream rounded mx-4 mb-3 py-2 font-body font-semibold"
      >
        + Nieuwe Post
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50"
          onClick={close}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="bg-cream text-navy p-6 rounded max-w-md w-full flex flex-col gap-4"
          >
            <h2 className="font-display text-2xl tracking-wide">
              Nieuwe post
            </h2>

            <label className="flex flex-col gap-1 text-sm font-body">
              Titel
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                required
                autoFocus
                className="border border-ice rounded px-3 py-2 bg-cream focus:outline-none focus:border-navy"
              />
            </label>

            <fieldset className="flex flex-col gap-1 text-sm font-body">
              <legend className="mb-1">Formaat</legend>
              {Object.entries(POST_FORMATS).map(([key, { label, w, h }]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="format"
                    value={key}
                    checked={format === key}
                    onChange={() => setFormat(key)}
                  />
                  {label}
                  <span className="text-steel text-xs">
                    {w}×{h}
                  </span>
                </label>
              ))}
            </fieldset>

            {error && <p className="text-error text-sm">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="bg-navy text-cream rounded px-4 py-2 font-body font-semibold disabled:opacity-60"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="bg-orange text-cream rounded px-4 py-2 font-body font-semibold disabled:opacity-60"
              >
                {submitting ? "Bezig..." : "Aanmaken"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
