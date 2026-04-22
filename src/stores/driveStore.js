import { create } from "zustand";
import {
  requestAccessToken,
  refreshAccessToken,
  revokeAccessToken,
} from "../lib/drive/auth";
import { ensureAppFolder } from "../lib/drive/folder";
import {
  getUserDriveSettings,
  setUserDriveSettings,
} from "../lib/firebase/firestore";

const DRIVE_AUTHED_KEY = "drive_authed";

function mapConnectError(err) {
  if (err?.type === "popup_closed") return null;
  if (err?.type === "popup_failed_to_open") {
    return "Browser blokkeerde de Drive-prompt. Probeer opnieuw of gebruik een andere browser.";
  }
  return err?.message || "Verbinden met Drive mislukt.";
}

export const useDriveStore = create((set, get) => ({
  accessToken: null,
  expiresAt: null,
  isAuthed: false,
  isLoading: false,
  error: null,
  needsReconnect: false,
  driveFolderId: null,
  bootstrapState: "idle",
  bootstrapError: null,

  async connect() {
    set({ isLoading: true, error: null });
    try {
      const { accessToken, expiresAt } = await requestAccessToken();
      localStorage.setItem(DRIVE_AUTHED_KEY, "true");
      set({
        accessToken,
        expiresAt,
        isAuthed: true,
        isLoading: false,
        error: null,
        needsReconnect: false,
      });
    } catch (err) {
      set({
        isAuthed: false,
        isLoading: false,
        error: mapConnectError(err),
      });
    }
  },

  async disconnect() {
    const current = get().accessToken;
    if (current) {
      await revokeAccessToken(current);
    }
    localStorage.removeItem(DRIVE_AUTHED_KEY);
    set({
      accessToken: null,
      expiresAt: null,
      isAuthed: false,
      isLoading: false,
      error: null,
      needsReconnect: false,
      driveFolderId: null,
      bootstrapState: "idle",
      bootstrapError: null,
    });
  },

  /**
   * Marks the store as needing a user-initiated reconnect. Called from the
   * mount effect when a stale `drive_authed` flag is detected.
   */
  setNeedsReconnect() {
    set({
      needsReconnect: true,
      isAuthed: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Clears the reconnect prompt without triggering a new OAuth flow.
   */
  clearReconnectState() {
    set({ needsReconnect: false, error: null });
  },

  /**
   * Returns a valid access token, refreshing silently if needed. Throws if no
   * valid token can be obtained without user interaction.
   * @returns {Promise<string>}
   */
  async ensureValidToken() {
    const { accessToken, expiresAt } = get();
    if (accessToken && expiresAt && Date.now() < expiresAt) {
      return accessToken;
    }
    if (localStorage.getItem(DRIVE_AUTHED_KEY) !== "true") {
      throw new Error("Drive is niet verbonden.");
    }
    try {
      const fresh = await refreshAccessToken();
      set({
        accessToken: fresh.accessToken,
        expiresAt: fresh.expiresAt,
        isAuthed: true,
        needsReconnect: false,
        error: null,
      });
      return fresh.accessToken;
    } catch (err) {
      set({
        accessToken: null,
        expiresAt: null,
        isAuthed: false,
        needsReconnect: true,
      });
      throw err;
    }
  },

  /**
   * Ensure the BEARBELL Content Studio folder exists in the user's Drive,
   * and that its ID is persisted in Firestore. Idempotent: if the folder
   * exists in Drive but not Firestore, only Firestore is updated. If it
   * exists in Firestore but was deleted from Drive, a new folder is created
   * and Firestore is updated to match.
   * @param {string} uid
   */
  async bootstrapDriveFolder(uid) {
    if (get().bootstrapState === "loading") return;
    set({ bootstrapState: "loading", bootstrapError: null });
    try {
      const settings = await getUserDriveSettings(uid);
      const existingInFirestore = settings?.driveFolderId ?? null;
      const folderId = await ensureAppFolder();
      if (existingInFirestore !== folderId) {
        await setUserDriveSettings(uid, { driveFolderId: folderId });
      }
      set({
        driveFolderId: folderId,
        bootstrapState: "ready",
        bootstrapError: null,
      });
    } catch (err) {
      set({
        bootstrapState: "error",
        bootstrapError: err?.message || "Drive-map bootstrap mislukt.",
      });
    }
  },
}));

if (import.meta.env.DEV) {
  window.__driveStore = useDriveStore;
}
