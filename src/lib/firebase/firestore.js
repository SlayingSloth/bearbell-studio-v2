import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { app } from "./init";
import { POST_FORMATS } from "../brand/tokens";

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

/**
 * Create a new post document. The post ID is generated with nanoid.
 * @param {string} uid
 * @param {{ title: string, format: keyof typeof POST_FORMATS }} fields
 * @returns {Promise<string>} the new postId
 */
export async function createPost(uid, { title, format }) {
  if (!POST_FORMATS[format]) {
    throw new Error(`Onbekend post-format: ${format}`);
  }
  const postId = nanoid();
  await setDoc(doc(db, "posts", postId), {
    ownerId: uid,
    title,
    status: "draft",
    format,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    tags: [],
    slideOrder: [],
    slides: {},
    shareToken: null,
    thumbnailDataUrl: null,
  });
  return postId;
}

/**
 * Fetch a single post by ID.
 * @param {string} postId
 * @returns {Promise<object | null>} the post with `id`, or null if not found
 */
export async function getPost(postId) {
  const snap = await getDoc(doc(db, "posts", postId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * List posts owned by a user, newest first by updatedAt.
 * @param {string} uid
 * @returns {Promise<object[]>}
 */
export async function listPostsForUser(uid) {
  const q = query(
    collection(db, "posts"),
    where("ownerId", "==", uid),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Merge-update a post. `updatedAt` is always refreshed to serverTimestamp().
 * @param {string} postId
 * @param {object} patch
 * @returns {Promise<void>}
 */
export async function updatePost(postId, patch) {
  await updateDoc(doc(db, "posts", postId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a post document.
 * @param {string} postId
 * @returns {Promise<void>}
 */
export async function deletePost(postId) {
  await deleteDoc(doc(db, "posts", postId));
}
