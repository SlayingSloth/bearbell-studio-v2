import { useEffect } from "react";
import { useDriveStore } from "../stores/driveStore";

const DRIVE_AUTHED_KEY = "drive_authed";

/**
 * Exposes Drive OAuth state and actions. On mount, if a stale `drive_authed`
 * flag exists in localStorage, the store is flipped to `needsReconnect: true`
 * synchronously — no API call, no popup attempt. The user reconnects with one
 * click via the Connect button.
 * @returns {{
 *   isAuthed: boolean,
 *   isLoading: boolean,
 *   error: string | null,
 *   accessToken: string | null,
 *   expiresAt: number | null,
 *   needsReconnect: boolean,
 *   connect: () => Promise<void>,
 *   disconnect: () => Promise<void>,
 *   clearReconnectState: () => void,
 * }}
 */
export function useDriveAuth() {
  const isAuthed = useDriveStore((s) => s.isAuthed);
  const isLoading = useDriveStore((s) => s.isLoading);
  const error = useDriveStore((s) => s.error);
  const accessToken = useDriveStore((s) => s.accessToken);
  const expiresAt = useDriveStore((s) => s.expiresAt);
  const needsReconnect = useDriveStore((s) => s.needsReconnect);
  const connect = useDriveStore((s) => s.connect);
  const disconnect = useDriveStore((s) => s.disconnect);
  const setNeedsReconnect = useDriveStore((s) => s.setNeedsReconnect);
  const clearReconnectState = useDriveStore((s) => s.clearReconnectState);

  useEffect(() => {
    if (isAuthed) return;
    if (needsReconnect) return;
    if (localStorage.getItem(DRIVE_AUTHED_KEY) !== "true") return;
    setNeedsReconnect();
  }, [isAuthed, needsReconnect, setNeedsReconnect]);

  return {
    isAuthed,
    isLoading,
    error,
    accessToken,
    expiresAt,
    needsReconnect,
    connect,
    disconnect,
    clearReconnectState,
  };
}
