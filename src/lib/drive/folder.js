import { getDriveClient } from "./client";

const APP_FOLDER_NAME = "BEARBELL Content Studio";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

/**
 * Search the user's Drive root for the app folder.
 * @returns {Promise<string | null>} driveFolderId, or null if not found.
 */
export async function findAppFolder() {
  const drive = await getDriveClient();
  const response = await drive.files.list({
    q: `'root' in parents and mimeType='${FOLDER_MIME_TYPE}' and trashed=false and name='${APP_FOLDER_NAME}'`,
    fields: "files(id, name)",
    pageSize: 1,
  });
  return response.result.files?.[0]?.id ?? null;
}

/**
 * Create the app folder in the user's Drive root.
 * @returns {Promise<string>} driveFolderId of the newly created folder.
 */
export async function createAppFolder() {
  const drive = await getDriveClient();
  const response = await drive.files.create({
    resource: { name: APP_FOLDER_NAME, mimeType: FOLDER_MIME_TYPE },
    fields: "id",
  });
  return response.result.id;
}

/**
 * Find the app folder, creating it if it does not exist.
 * @returns {Promise<string>} driveFolderId.
 */
export async function ensureAppFolder() {
  return (await findAppFolder()) ?? (await createAppFolder());
}
