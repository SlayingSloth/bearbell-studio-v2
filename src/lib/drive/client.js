import { useDriveStore } from "../../stores/driveStore";

const GAPI_SCRIPT_URL = "https://apis.google.com/js/api.js";
const DRIVE_DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("Missing VITE_GOOGLE_API_KEY. Check .env.local.");
}

let gapiScriptPromise = null;
let gapiClientReadyPromise = null;

function loadGapiScript() {
  if (gapiScriptPromise) return gapiScriptPromise;
  gapiScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GAPI_SCRIPT_URL}"]`);
    if (existing) {
      if (window.gapi) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google API script."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = GAPI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google API script."));
    document.head.appendChild(script);
  });
  return gapiScriptPromise;
}

function initGapiClient() {
  if (gapiClientReadyPromise) return gapiClientReadyPromise;
  gapiClientReadyPromise = (async () => {
    await loadGapiScript();
    await new Promise((resolve, reject) =>
      window.gapi.load("client", {
        callback: resolve,
        onerror: () => reject(new Error("Failed to load gapi client.")),
      })
    );
    await window.gapi.client.init({
      apiKey,
      discoveryDocs: [DRIVE_DISCOVERY_DOC],
    });
  })();
  return gapiClientReadyPromise;
}

/**
 * Returns an initialized `gapi.client.drive` with the current access token
 * applied. Throws if no valid token is available (store will have flipped to
 * `needsReconnect: true`).
 * @returns {Promise<typeof window.gapi.client.drive>}
 */
export async function getDriveClient() {
  await initGapiClient();
  const token = await useDriveStore.getState().ensureValidToken();
  window.gapi.client.setToken({ access_token: token });
  return window.gapi.client.drive;
}
