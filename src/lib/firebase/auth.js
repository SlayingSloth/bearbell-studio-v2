import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { app } from "./init";

export const auth = getAuth(app);

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {{ rememberMe?: boolean }} [options] - `rememberMe` true persists the
 *   session across browser restarts (localStorage); false keeps it only for the
 *   current tab (sessionStorage). Defaults to true.
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function signIn(email, password, { rememberMe = true } = {}) {
  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence;
  await setPersistence(auth, persistence);
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign the current user out.
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  return signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {() => void} Unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
