import { useEffect, useState } from "react";

export function ConfirmDelete({ open, title, message, onConfirm, onCancel }) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onCancel]);

  if (!open) return null;

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50"
      onClick={() => !submitting && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream text-navy p-6 rounded max-w-md w-full flex flex-col gap-4"
      >
        <h2 className="font-display text-2xl tracking-wide">{title}</h2>
        <p className="font-body text-sm">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="bg-navy text-cream rounded px-4 py-2 font-body font-semibold disabled:opacity-60"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-error text-cream rounded px-4 py-2 font-body font-semibold disabled:opacity-60"
          >
            {submitting ? "Bezig..." : "Verwijderen"}
          </button>
        </div>
      </div>
    </div>
  );
}
