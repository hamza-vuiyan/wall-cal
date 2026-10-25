# WallCal

> **Your physical calendar, reimagined.**  
> A beautiful, offline-first productivity web app inspired by the tactile feel of a wall calendar.

WallCal is a Progressive Web App (PWA) built with React, TypeScript, and Firebase. It lets you annotate days with color marks, write notes, manage tasks, track habits, run multi-day challenges, and pin important dates — all from a clean, distraction-free interface. Data lives locally first and optionally syncs to the cloud via Firebase when you sign in with Google.

---

## ✨ Features

### 📅 Calendar
- **Monthly grid view** — full 6-week calendar (42-cell) with smooth month navigation.
- **Day cells** — click any day to open a full editor with notes, tasks, marks, and color highlights.
- **Visual marks** — annotate days with ✓ (check), ✗ (X), or ○ (circle) marks.
- **Day color highlights** — eight color accents (yellow, orange, red, pink, purple, blue, teal, green) visible directly on the grid.
- **Calendar search** — full-text search across notes, tasks, and important dates.
- **Configurable week start** — Sunday or Monday, per user preference.

### ✅ Tasks
- Per-day tasks with title, optional time (HH:MM), description, and color accent.
- Toggle completion, edit in-place, drag-to-reorder within a day.
- Quick task summary visible on the Home dashboard.

### 📝 Notes
- Rich multi-note support per day with optional color highlights.
- Notes are timestamped (created / last edited) and shown in the calendar cell as indicators.

### 🏆 Challenges
- Define a multi-day challenge with a name, date range, optional description, and color.
- Mark individual days as complete from the Challenge Detail page.
- Progress bar and streak tracking per challenge.
- Active challenges surfaced on the Home dashboard with live progress.

### 🔄 Habits
- Daily recurring habits tracked on the calendar grid.
- Habit manager: create, edit, reorder (drag-and-drop), and delete habits.
- Mark habit completions per-day directly from the day cell.
- Color-coded habit dots overlaid on calendar cells.

### 📌 Important Dates
- Pin one-off events (birthdays, exams, deadlines, travel, etc.) with a date, optional time, category, and preset icon.
- Important date indicators appear on the calendar grid with upcoming-countdown cards on the Home page.
- Nine icon presets: `birthday`, `exam`, `deadline`, `interview`, `travel`, `celebration`, `health`, `money`, `star`.

### 🏠 Home Dashboard
- Time-aware greeting (morning / afternoon / evening).
- Today's task list with quick add and completion toggle.
- Today's notes preview (if any).
- Active challenges with live progress bars.
- Upcoming important-date countdowns.

### ⚙️ Settings
- **Theme** — Light / Dark / System (auto follows OS preference). Theme is persisted and applied before first paint to prevent flash.
- **Account** — Guest mode (local storage) or Google Sign-In (cloud sync).
- **Export / Import** — Full JSON backup of all data. Import supports *Merge* (newest-wins per item) or *Replace* (overwrite everything).
- **Danger Zone** — Reset all local and cloud data with a confirmation step.

### ☁️ Sync & Storage
- **Guest mode** — all data stored in `localStorage`, zero network required.
- **Cloud sync** — sign in with Google to sync data to Firestore in real-time.
- **Offline banner** — alerts when the browser is offline; app continues to work from cache.
- **Migration** — when a guest with existing local data signs in, a migration banner offers to upload or merge local data into the new cloud account.
- **Conflict resolution** — `updatedAt` timestamps used for per-day / per-item newest-wins merging.

### 📱 PWA Support
- Installable on desktop and mobile (Add to Home Screen).
- Service Worker caches assets and Google Fonts for full offline functionality.
- Standalone display mode with correct theme color and splash behavior.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/) |
| Build tool | [Vite 8](https://vite.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| State management | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Backend / Auth | [Firebase 12](https://firebase.google.com/) (Auth + Firestore) |
| Drag & drop | [@dnd-kit](https://dndkit.com/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| Confetti | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| Fonts | Inter + Playfair Display (Google Fonts) |
| Linting | ESLint 10 + typescript-eslint |
| Formatting | Prettier 3 + prettier-plugin-tailwindcss |
| CI/CD | GitHub Actions → GitHub Pages |

---

## 📁 Project Structure

```
WallCal/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions — build & deploy to GitHub Pages
├── public/                     # Static assets (favicon, icon)
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component, hash-based routing, auth init
│   ├── index.css               # Global styles, design tokens, Tailwind base
│   ├── assets/                 # Bundled static assets
│   ├── components/
│   │   ├── Header.tsx          # Top navigation bar
│   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   ├── Footer.tsx          # App footer
│   │   ├── OfflineBanner.tsx   # Offline status indicator
│   │   ├── auth/               # MigrationBanner (guest → cloud prompt)
│   │   ├── calendar/           # CalendarGrid, DayCell, NoteEditorModal, TaskListModal, …
│   │   ├── challenges/         # ChallengeEditorModal
│   │   ├── habits/             # HabitManagerModal, HabitEditorModal, HabitDayModal
│   │   ├── home/               # UpcomingCountdowns
│   │   ├── importantdates/     # ImportantDateManagerModal, ImportantDateListModal, …
│   │   ├── ui/                 # Shared UI primitives
│   │   └── wishlist/           # WishlistItem components
│   ├── hooks/
│   │   ├── useTheme.ts         # Theme persistence + OS listener
│   │   └── useCalendar.ts      # Calendar grid generation logic
│   ├── pages/
│   │   ├── HomePage.tsx        # Dashboard (greeting, tasks, challenges, countdowns)
│   │   ├── CalendarPage.tsx    # Full monthly calendar view
│   │   ├── ChallengesPage.tsx  # Challenge list
│   │   ├── ChallengeDetailPage.tsx  # Individual challenge day-tracker
│   │   └── SettingsPage.tsx    # Theme, account, data management
│   ├── services/
│   │   ├── auth/               # Firebase Auth helpers
│   │   ├── firebase/           # Firebase app initialisation
│   │   └── storage/
│   │       ├── types.ts        # Full data model (WallCalData, Task, Note, Habit, …)
│   │       ├── StorageAdapter.ts    # Adapter interface
│   │       ├── LocalStorageAdapter.ts  # localStorage implementation
│   │       ├── FirestoreAdapter.ts     # Firestore implementation
│   │       └── PersistenceService.ts   # Adapter switcher + subscription
│   ├── store/
│   │   └── useAppStore.ts      # Zustand global store (all actions + selectors)
│   ├── types/
│   │   └── index.ts            # App-level types (AppView, CalendarDay, re-exports)
│   └── utils/
│       ├── backupUtils.ts      # JSON export / import + validation
│       ├── challengeUtils.ts   # Challenge progress calculations
│       ├── dateUtils.ts        # Date formatting helpers
│       ├── habitUtils.ts       # Habit scheduling helpers
│       ├── importantDateUtils.ts  # Countdown + sorting logic
│       └── searchUtils.ts      # Full-text search across all data
├── firestore.rules             # Firestore security rules (user-scoped isolation)
├── .env.example                # Environment variable template
├── vite.config.ts              # Vite + TailwindCSS + PWA configuration
├── tsconfig.app.json           # TypeScript config for src/
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- A [Firebase project](https://console.firebase.google.com/) (required only for cloud sync; the app works in guest mode without it)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/WallCal.git
cd WallCal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** Firebase credentials are only needed for the Google Sign-In and cloud sync features. The app runs fully in guest mode without any Firebase configuration.

You can find these values in the Firebase Console → **Project Settings → Your apps → Web app → SDK setup and configuration**.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔥 Firebase Setup

To enable Google Sign-In and cloud sync:

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com/).

2. **Enable Authentication** → Sign-in method → **Google**.

3. **Enable Firestore Database** in production mode.

4. **Deploy Firestore security rules** from the `firestore.rules` file:

   ```bash
   firebase deploy --only firestore:rules
   ```

   The rules enforce that each authenticated user can only read and write their own data under `users/{uid}/...`. All unauthenticated requests are denied.

5. **Add your domain** to the Firebase Auth authorized domains list (Firebase Console → Authentication → Settings → Authorized domains).

---

## 🏗️ Build

### Production build

```bash
npm run build
```

The compiled output is in the `dist/` directory.

### Preview the production build locally

```bash
npm run preview
```

---

## 🚢 Deployment

### GitHub Pages (automated)

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that automatically builds and deploys to GitHub Pages on every push to the `master` branch.

**Setup:**

1. In your GitHub repository, go to **Settings → Pages** and set the source to **GitHub Actions**.

2. Go to **Settings → Variables → Actions** and add the following repository variables (not secrets — Vite inlines them at build time):

   | Variable | Value |
   |---|---|
   | `VITE_FIREBASE_API_KEY` | Your Firebase API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
   | `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase messaging sender ID |
   | `VITE_FIREBASE_APP_ID` | Your Firebase app ID |

3. Push to `master` — the workflow will build and deploy automatically.

> **Note:** The workflow automatically sets `VITE_BASE_PATH=/<repo-name>/` so assets resolve correctly when hosted under a GitHub Pages project path.

### Manual / other hosts

Build with `npm run build` and serve the `dist/` directory from any static host (Netlify, Vercel, Cloudflare Pages, etc.). Set the environment variables in your host's dashboard.

---

## 🧹 Code Quality

```bash
# Lint
npm run lint

# Format with Prettier
npm run format
```

---

## 🗺️ Routing

WallCal uses **hash-based routing** (no router library) for maximum compatibility with static hosts:

| Hash | View |
|---|---|
| `#home` | Home dashboard |
| `#calendar` | Monthly calendar |
| `#challenges` | Challenges list / detail |
| `#settings` | Settings |

Scroll positions are saved and restored synchronously across view transitions to prevent flash.

---

## 💾 Data Model

All user data is stored in a single `WallCalData` envelope:

```typescript
interface WallCalData {
  version: number                     // Schema version for future migrations
  days: Record<string, DayEntry>      // Keyed by "YYYY-MM-DD"
  challenges?: Challenge[]
  habits?: Habit[]
  importantDates?: ImportantDate[]
  wishlistItems?: WishlistItem[]
  settings: UserSettings
  updatedAt: number                   // Unix ms — used for sync conflict resolution
}
```

In **guest mode**, this envelope is serialised to `localStorage`. In **cloud mode**, it is stored in Firestore at `users/{uid}/data/main` and updated via a real-time listener.

### Conflict Resolution

When merging two copies of data (e.g. local + remote after sign-in):
- **Per-day entries** — highest `updatedAt` wins.
- **Challenges, Habits, Important Dates, Wishlist** — merged by `id`; highest `updatedAt` per item wins.
- **Settings** — the overall newer document's settings take precedence.

---

## 📤 Backup & Restore

From **Settings → Data**:

- **Export JSON** — downloads a timestamped `.json` backup of your complete data.
- **Import JSON** — select a previously exported backup. Choose:
  - **Merge** — blend backup with existing data (newest-wins per item).
  - **Replace** — overwrite all current data with the backup.

---

## 🔒 Security

- Firestore rules ensure each user can **only access their own data**. Cross-user reads and writes are impossible at the database level.
- Firebase credentials (`VITE_FIREBASE_*`) are public-facing (as is standard for client-side Firebase apps) and are protected by Firebase's own security rules, not kept secret.
- **Never commit `.env.local`** — it is listed in `.gitignore`.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Commit your changes: `git commit -m 'feat: add your feature'`.
4. Push the branch: `git push origin feat/your-feature`.
5. Open a Pull Request.

Please run `npm run lint` and `npm run format` before submitting.

---

## 📄 License

This project is open source. See the [LICENSE](LICENSE) file for details.
