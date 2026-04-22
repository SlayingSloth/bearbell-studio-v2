import { useCallback, useEffect } from "react";
import { useDriveStore } from "../stores/driveStore";
import { useAuth } from "./useAuth";

const DRIVE_AUTHED_KEY = "drive_authed";

/**
 * Exposes Drive OAuth state and actions. On mount, if a stale `drive_authed`
 * flag exists in localStorage, the store is flipped to `needsReconnect: true`
 * synchronously — no API call, no popup attempt. Once authed, triggers a
 * background folder bootstrap against the current Firebase user.
 * @returns {{
 *   isAuthed: boolean,
 *   isLoading: boolean,
 *   error: string | null,
 *   accessToken: string | null,
 *   expiresAt: number | null,
 *   needsReconnect: boolean,
 *   driveFolderId: string | null,
 *   bootstrapState: 'idle' | 'loading' | 'ready' | 'error',
 *   bootstrapError: string | null,
 *   connect: () => Promise<void>,
 *   disconnect: () => Promise<void>,
 *   clearReconnectState: () => void,
 *   retryBootstrap: () => Promise<void>,
 * }}
 */
export function useDriveAuth() {
  const { user } = useAuth();
  const isAuthed = useDriveStore((s) => s.isAuthed);
  const isLoading = useDriveStore((s) => s.isLoading);
  const error = useDriveStore((s) => s.error);
  const accessToken = useDriveStore((s) => s.accessToken);
  const expiresAt = useDriveStore((s) => s.expiresAt);
  const needsReconnect = useDriveStore((s) => s.needsReconnect);
  const driveFolderId = useDriveStore((s) => s.driveFolderId);
  const bootstrapState = useDriveStore((s) => s.bootstrapState);
  const bootstrapError = useDriveStore((s) => s.bootstrapError);
  const connect = useDriveStore((s) => s.connect);
  const disconnect = useDriveStore((s) => s.disconnect);
  const setNeedsReconnect = useDriveStore((s) => s.setNeedsReconnect);
  const clearReconnectState = useDriveStore((s) => s.clearReconnectState);
  const bootstrapDriveFolder = useDriveStore((s) => s.bootstrapDriveFolder);

  useEffect(() => {
    if (isAuthed) return;
    if (needsReconnect) return;
    if (localStorage.getItem(DRIVE_AUTHED_KEY) !== "true") return;
    setNeedsReconnect();
  }, [isAuthed, needsReconnect, setNeedsReconnect]);

  const uid = user?.uid;
  useEffect(() => {
    if (!isAuthed || needsReconnect) return;
    if (!uid) return;
    if (bootstrapState !== "idle") return;
    bootstrapDriveFolder(uid);
  }, [isAuthed, needsReconnect, uid, bootstrapState, bootstrapDriveFolder]);

  const retryBootstrap = useCallback(async () => {
    if (!uid) return;
    await bootstrapDriveFolder(uid);
  }, [uid, bootstrapDriveFolder]);

  return {
    isAuthed,
    isLoading,
    error,
    accessToken,
    expiresAt,
    needsReconnect,
    driveFolderId,
    bootstrapState,
    bootstrapError,
    connect,
    disconnect,
    clearReconnectState,
    retryBootstrap,
  };
}
