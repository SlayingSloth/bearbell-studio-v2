import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { app } from "./init";

export const db = getFirestore(app);

/**
 * Read the Drive settings subdocument for a user.
 * @param {string} uid
 * @returns {Promise<{ driveFolderId: string, folderCreatedAt: unknown } | null>}
 */
export async function getUserDriveSettings(uid) {
  const ref = doc(db, "users", uid, "settings", "drive");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Write the Drive settings subdocument for a user.
 * @param {string} uid
 * @param {{ driveFolderId: string }} settings
 * @returns {Promise<void>}
 */
export async function setUserDriveSettings(uid, { driveFolderId }) {
  const ref = doc(db, "users", uid, "settings", "drive");
  await setDoc(ref, { driveFolderId, folderCreatedAt: serverTimestamp() });
}
