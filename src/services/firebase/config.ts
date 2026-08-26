import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

// ── Firebase configuration ────────────────────────────────────────
// Values are injected at build time via Vite env vars.
// Copy .env.example → .env.local and fill in your project values.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Prevent duplicate initialisation during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true })

// Enable offline persistence (IndexedDB cache).
// Errors here are non-fatal — e.g. multiple tabs open simultaneously.
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence works in the active tab only.
    console.warn('[WallCal] Firestore offline persistence unavailable (multiple tabs open).')
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support the required APIs.
    console.warn('[WallCal] Firestore offline persistence is not supported in this browser.')
  }
})

export default app
