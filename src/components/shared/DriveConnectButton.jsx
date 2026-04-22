import { useDriveAuth } from "../../hooks/useDriveAuth";

function BootstrapStatus({ state, error, onRetry }) {
  if (state === "loading") {
    return <p className="text-steel text-xs">Mappen controleren...</p>;
  }
  if (state === "ready") {
    return (
      <p className="text-steel text-xs">Map: BEARBELL Content Studio ✓</p>
    );
  }
  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-1">
        <p className="text-error text-sm">{error}</p>
        <button
          onClick={onRetry}
          className="bg-navy text-cream rounded px-3 py-1 text-xs font-body font-semibold"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }
  return null;
}

export function DriveConnectButton() {
  const {
    isAuthed,
    isLoading,
    error,
    needsReconnect,
    bootstrapState,
    bootstrapError,
    connect,
    disconnect,
    retryBootstrap,
  } = useDriveAuth();

  let content;
  if (isLoading) {
    content = (
      <button
        disabled
        className="bg-orange text-cream rounded px-4 py-2 font-body font-semibold disabled:opacity-60"
      >
        Verbinden met Drive...
      </button>
    );
  } else if (isAuthed && !needsReconnect) {
    content = (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-navy font-body">Drive verbonden ✓</span>
          <button
            onClick={disconnect}
            className="bg-navy text-cream rounded px-4 py-2 font-body font-semibold"
          >
            Loskoppelen
          </button>
        </div>
        <BootstrapStatus
          state={bootstrapState}
          error={bootstrapError}
          onRetry={retryBootstrap}
        />
      </div>
    );
  } else if (needsReconnect) {
    content = (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={connect}
          className="bg-orange text-cream rounded px-4 py-2 font-body font-semibold"
        >
          Drive opnieuw verbinden
        </button>
        <p className="text-steel text-xs">
          Een snelle herbevestiging is nodig na inloggen.
        </p>
      </div>
    );
  } else {
    content = (
      <button
        onClick={connect}
        className="bg-orange text-cream rounded px-4 py-2 font-body font-semibold"
      >
        Koppel Google Drive
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {content}
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
}
