# interactiveGame

A React Native (Expo) game where a researcher selects a target fruit, then a player taps on that fruit among distractors. The app tracks all taps with coordinates, captures a silent front-camera photo on every tap (with user consent), and stores session data in Firestore.

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your physical device (Android or iOS)
- A Firebase project with Firestore enabled

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd interactiveGame
npm install
```

### 2. Install Expo Dependencies

```bash
npx expo install expo-camera react-native-svg
npm install react-native-svg-transformer
npm install --save-dev eslint @react-native/eslint-config
```

### 3. Configure Firebase

Create `config/firebase.js` and paste your Firebase project credentials:

```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

To get these values: Firebase Console → Your Project → Project Settings → Your Apps → Web App.

### 4. Set Firestore Rules

In Firebase Console → Firestore → Rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ These rules are open for development. Lock them down before going to production.

### 5. Configure Metro for SVG

Create `metro.config.js` in the project root:

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
```

Also create `declarations.d.ts` in the project root:

```ts
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
```

### 6. Add Fruit SVG Icons

Place your 4 SVG fruit icons in `assets/icons/`:

```
assets/icons/apple.svg
assets/icons/banana.svg
assets/icons/grapes.svg
assets/icons/carrot.svg
```

### 7. Fix Orientation to Landscape

In `app.json`:

```json
{
  "expo": {
    "orientation": "landscape"
  }
}
```

### 8. Run the App

```bash
npx expo start --clear
```

Scan the QR code with the **Expo Go** app on your device.

### 9. Lint

```bash
npm run lint
```

---

## App Flow

```
SelectFruitScreen
  → Researcher picks the target fruit from a row of SVG icons
  → Taps "Start Game with <Fruit>"

GameScreen
  → Player taps fruits for 2 minutes
  → Session data saved to Firestore
  → Alert shown on session end

  → OK dismissed → back to SelectFruitScreen
```

---

## Assumptions Made

- **Target fruit is chosen by the researcher, not the player.** A dedicated selection screen appears before each game session. The researcher picks the target fruit and the game starts with that choice locked in for the full session.

- **Fixed landscape orientation.** The game is designed exclusively for horizontal screens. No portrait support or dynamic orientation detection is implemented.

- **Physical device only.** The front camera capture feature requires a real device. Emulators do not have a functional front-facing camera.

- **4 fruits always visible per round.** Each spawn cycle renders exactly 4 randomly selected fruits at random coordinates. The target fruit is always one of these 4.

- **One target fruit per session.** The target fruit is chosen on the selection screen and remains the same for the full 2-minute session. After the session ends, the researcher is returned to the selection screen to pick again.

- **Camera capture requires explicit user consent.** A consent modal is shown before the game starts explaining that front-camera photos will be taken on every tap. The camera is only mounted and capture only runs if the user explicitly agrees. Users who decline can still play — photos are simply not taken.

- **Async photo capture does not block gameplay.** Photos are taken asynchronously after a tap registers, so the game interaction is never delayed by camera processing.

- **Firestore session must be created before gameplay begins.** If the Firestore session document fails to create (e.g. network error), the game will not start and the user is shown an error message. This prevents sessions from running without a valid document to write to.

- **Local photo URIs only (Storage deferred).** Firebase Storage integration is planned but not yet active. Photos are currently saved as local device URIs in the tap records. Upload to Firebase Storage is a future phase.

- **Session summary shown at game end.** When the 2-minute timer expires, an alert displays total taps, correct taps, incorrect taps, and accuracy. Dismissing the alert returns to the fruit selection screen.

- **Tap coordinates are screen-relative.** `locationX` and `locationY` from `nativeEvent` are used directly. They represent pixel coordinates relative to the game screen container.

- **Tap types are defined as constants.** `"correct"`, `"incorrect"`, and `"background"` are centralised in a `TAP_TYPES` constant in `gameHelper.js` to avoid magic strings across the codebase.

- **No navigation library used.** Screen transitions are handled via a single state variable in `App.js`. When `targetFruit` is `null` the selection screen is shown; when it is set the game screen is shown. This keeps the setup simple with no additional dependencies.

---

## Tech Decisions

### Expo over bare React Native
Expo was chosen to avoid the complexity of native build tooling (Android NDK, Gradle, Xcode). Expo Go enables instant testing on a physical device via QR code with zero native build steps.

### State toggle for navigation instead of a navigation library
Since the app has only two screens with a straightforward linear flow, a navigation library would add unnecessary overhead. A single `targetFruit` state variable in `App.js` controls which screen is rendered — `null` shows the selection screen, a fruit object shows the game screen.

### Researcher-controlled target fruit selection
Rather than randomising the target fruit internally, the selection is exposed on a dedicated screen before each session. This gives the researcher full control over the experiment setup without needing to touch code between sessions.

### Firestore session created before game starts
`setGameActive(true)` is only called after `addDoc` resolves successfully. If the write fails, the game aborts and the user is notified. This guarantees that every running game session has a valid Firestore document to write tap data to at the end.

### Firebase Firestore for data storage
Firestore was chosen for its real-time capabilities, flexible document model, and straightforward React Native SDK. The schema is designed to be scalable — session metadata lives in a root document and individual taps are stored in a subcollection to avoid Firestore's 1MB per-document limit.

### Taps as a Firestore subcollection (not an array)
Storing taps as an array inside the session document would hit Firestore's document size limit in long or high-frequency sessions. A subcollection gives unlimited scalability, and individual taps can be queried independently (e.g. filter by `tapType == "correct"`).

### Modular component and hook structure
`GameScreen.jsx` is kept as a thin orchestrator (~80 lines). Logic is split into focused hooks (`useGameSession`, `useFruitSpawner`, `useCamera`) and UI is split into small components (`FruitItem`, `GameHUD`, `StartOverlay`, `PermissionGate`, `SelectFruitScreen`). Each file has a single clear responsibility, making the codebase easier to test and extend.

### Explicit camera consent modal
Rather than relying solely on the OS camera permission prompt, a clear in-app consent modal explains exactly how the camera is used before the game starts. The camera is only mounted if the user agrees, and capture is gated behind the consent flag throughout the session.

### expo-camera for silent front-camera capture
`expo-camera` provides a `CameraView` ref with `takePictureAsync()` that supports `shutterSound: false` and `animateShutter={false}` for fully silent captures. The camera view is rendered at 1×1 pixels with `opacity: 0` — active but invisible — so it does not interfere with the game UI.

### react-native-svg + react-native-svg-transformer for fruit icons
SVG icons are used instead of PNG or emoji for crisp rendering at any screen density. `react-native-svg-transformer` allows SVGs to be imported directly as React components, keeping icon integration clean and type-safe.

### useRef for tap and fruit state during gameplay
React state updates are asynchronous and would cause stale closures inside tap handlers. `useRef` is used for `tapsRef`, `fruitsRef`, `targetRef`, and `fruitTimeoutRef` so that handlers always read the latest values without triggering unnecessary re-renders during the game loop.

### fruitTimeoutRef to track and cancel inner setTimeout
The fruit spawner uses a `setInterval` with an inner `setTimeout` to auto-hide fruits. The timeout is tracked in `fruitTimeoutRef` and explicitly cancelled in both the `useEffect` cleanup and `endGame`, preventing stale timeouts from firing after a restart or unmount.

### Promise.all for batch tap writes
All tap documents are written to Firestore simultaneously using `Promise.all()` rather than sequentially. This minimises total write time at game end, especially for sessions with many taps.

### TAP_TYPES constants instead of magic strings
Tap type values (`"correct"`, `"incorrect"`, `"background"`) are defined once in `gameHelper.js` and imported wherever needed. This eliminates typo risk and makes future refactoring straightforward.

### ESLint for code quality
ESLint with `@react-native/eslint-config` is configured to catch unused variables, hook dependency issues, and style regressions early. Run with `npm run lint`.
