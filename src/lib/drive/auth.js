const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const EXPIRY_SAFETY_MS = 60_000;

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!clientId) {
  throw new Error("Missing VITE_GOOGLE_CLIENT_ID. Check .env.local.");
}

let gisLoadPromise = null;
let tokenClient = null;

function loadGisScript() {
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`);
    if (existing) {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

async function getTokenClient() {
  await loadGisScript();
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: () => {},
    });
  }
  return tokenClient;
}

function requestToken({ prompt }) {
  return new Promise((resolve, reject) => {
    getTokenClient()
      .then((client) => {
        client.callback = (response) => {
          if (response.error) {
            reject(
              new Error(
                response.error_description || response.error || "OAuth error"
              )
            );
            return;
          }
          const expiresIn = Number(response.expires_in) || 3600;
          resolve({
            accessToken: response.access_token,
            expiresAt: Date.now() + expiresIn * 1000 - EXPIRY_SAFETY_MS,
          });
        };
        client.requestAccessToken({ prompt });
      })
      .catch(reject);
  });
}

/**
 * Request a Drive access token, showing Google's consent UI only if needed.
 * @returns {Promise<{ accessToken: string, expiresAt: number }>}
 */
export function requestAccessToken() {
  return requestToken({ prompt: "" });
}

/**
 * Silent refresh: attempts to get a fresh token without showing any UI.
 * Rejects if user interaction would be required.
 * @returns {Promise<{ accessToken: string, expiresAt: number }>}
 */
export function refreshAccessToken() {
  return requestToken({ prompt: "" });
}

/**
 * Best-effort revoke of an access token. Never rejects.
 * @param {string} accessToken
 * @returns {Promise<void>}
 */
export function revokeAccessToken(accessToken) {
  return new Promise((resolve) => {
    if (!accessToken || !window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    try {
      window.google.accounts.oauth2.revoke(accessToken, () => resolve());
    } catch {
      resolve();
    }
  });
}
