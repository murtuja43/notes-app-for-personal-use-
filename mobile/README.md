# NoteAll — Mobile (Expo + React Native)

The Android/iOS client for NoteAll. It talks to the **same backend API**
as the web app (the Next.js server in the parent folder).

## Tech stack

- Expo SDK 52 + React Native 0.76
- TypeScript
- React Navigation (native stack)
- `expo-secure-store` for secure token storage

## Prerequisites

1. The backend must be running and reachable. Either:
   - run the web project locally (`npm run dev` in the parent folder), or
   - point the app at your deployed Vercel URL.
2. [Expo Go](https://expo.dev/go) on your phone, or an Android emulator / iOS simulator.

## Setup

```bash
cd mobile
npm install
cp .env.example .env
```

Then set the API URL in `.env` (`EXPO_PUBLIC_API_URL`). Choose based on how you run the app:

| Running on… | Use this URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Physical device (Expo Go) | `http://<your-computer-LAN-IP>:3000` |
| Against production | `https://your-app.vercel.app` |

> A physical device cannot see your computer's `localhost`. Use your machine's
> LAN IP (e.g. `http://192.168.1.20:3000`) and make sure both devices are on the
> same Wi‑Fi network.

## Run

```bash
npm start          # opens Expo Dev Tools; press "a" for Android, "i" for iOS
# or
npm run android    # build & open on a connected Android device/emulator
```

## How auth works

- The app calls `POST /api/auth/login` and receives a JWT **Bearer token**.
- The token is stored securely with `expo-secure-store`.
- Every notes request sends `Authorization: Bearer <token>`.
- On launch the saved token is restored, so you stay logged in.

## Project structure

```
mobile/
├── App.tsx                 # Root: providers + navigation
└── src/
    ├── components/         # Reusable UI (Button, TextField, NoteForm, NoteListItem)
    ├── context/            # AuthContext (token + user state)
    ├── navigation/         # Root / Auth / App navigators + param types
    ├── screens/            # Login, Register, NotesList, CreateNote, EditNote
    ├── services/           # api client, secure storage, config
    ├── types/              # Shared TypeScript types
    └── theme.ts            # Colors / spacing tokens
```

## Build an Android APK

Use [EAS Build](https://docs.expo.dev/build/setup/):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
