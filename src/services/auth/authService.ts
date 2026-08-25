import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from '@/services/firebase/config'

const googleProvider = new GoogleAuthProvider()

/**
 * Opens a Google sign-in popup.
 * Throws on cancellation or failure — callers handle the error.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

/**
 * Signs out the current Firebase user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

/**
 * Subscribes to Firebase auth state changes.
 * Returns the unsubscribe function (call in cleanup).
 *
 * @param callback - Receives `User` when signed in, `null` when signed out.
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

/** Returns the currently signed-in user, or null. */
export function getCurrentUser(): User | null {
  return auth.currentUser
}
