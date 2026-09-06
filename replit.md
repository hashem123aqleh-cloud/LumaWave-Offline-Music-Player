# Offline Music Player

A private iPhone music player for importing MP3s the user owns and listening offline with background playback.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/offline-music-player` — Expo mobile app and local music library.
- `artifacts/offline-music-player/context/MusicContext.tsx` — AsyncStorage-backed library and Expo Audio playback state.
- `artifacts/offline-music-player/app/(tabs)` — Home, Library, and Settings screens.
- `artifacts/offline-music-player/app/player.tsx` — full-screen player.
- `artifacts/offline-music-player/app/playlist.tsx` — playlist detail, editing, and song selection.

## Architecture decisions

- The first version is local-first: MP3 files are copied into the app's document directory and library metadata is persisted with AsyncStorage.
- Expo Audio is configured for silent-mode playback and background playback; the `expo-audio` config plugin supplies iOS background audio support.
- The app imports files the user owns through the iOS Files picker rather than downloading protected music from streaming services.
- Playlists, favorites, volume, and library metadata are persisted locally with AsyncStorage so the app remains useful offline.

## Product

- Import one or more MP3 files from Files.
- Browse an offline library with generated album artwork.
- Play, pause, skip, seek, and use a mini player.
- Create, rename, customize, fill, and delete playlists.
- Search the library, favorite songs, and control volume with a custom touch slider.
- Continue audio while the screen is locked or the app is backgrounded.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
