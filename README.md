# Notes App — Web + Android

A simple, production-ready cross-platform notes app. Create an account with
email + password, then create, edit, delete, and view your notes from the
**web** or an **Android** app — all backed by the same API and database, so
your notes follow you across devices.

## Features

- 🔐 Email + password auth (register / login), passwords hashed with **bcrypt**
- 📝 Full notes CRUD (create, read, update, delete)
- 🔒 Per-user data isolation — you can only ever see your own notes
- 🌐 Web app (Next.js) **and** 📱 Android app (Expo) sharing one backend
- ☁️ Deployable to Vercel + Neon PostgreSQL

## Tech stack

| Layer | Tech |
| --- | --- |
| Web frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui-style components |
| Backend API | Next.js API Routes |
| Mobile | React Native + Expo (TypeScript) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth (Credentials provider, JWT sessions) + JWT Bearer tokens for mobile |
| Hosting | Vercel (web + API), Neon (database) |

## Repository layout

```
.
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # NextAuth handler (web session)
│   │   │   ├── login/          # POST – token login (mobile)
│   │   │   └── register/       # POST – create account
│   │   └── notes/
│   │       ├── route.ts        # GET (list) + POST (create)
│   │       └── [id]/route.ts   # PUT (update) + DELETE
│   ├── dashboard/          # Protected notes dashboard
│   ├── login/  register/   # Auth pages
│   └── page.tsx            # Landing page
├── components/             # UI components (ui/* primitives + app components)
├── hooks/                  # useNotes() client hook
├── lib/                    # prisma, auth, validations, session, token helpers
├── prisma/                 # schema, migrations, seed
├── types/                  # Shared + NextAuth type augmentation
├── mobile/                 # Expo React Native app (see mobile/README.md)
├── .env.example
└── vercel.json
```

## Database schema

```
User  ──< Note
```

- **User**: `id`, `email` (unique), `password` (hashed), `createdAt`, `updatedAt`
- **Note**: `id`, `title`, `content`, `userId` → User, `createdAt`, `updatedAt`

One user has many notes; deleting a user cascades to their notes.

---

## Getting started (local)

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database. The easiest free option is [Neon](https://neon.tech) —
  create a project and copy the connection string. (Any local Postgres works too.)

### 2. Install & configure

```bash
# from the project root
npm install
cp .env.example .env
```

Fill in `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npm run db:deploy   # apply migrations to your database
npm run db:seed     # (optional) create a demo user with sample notes
```

The seed creates a demo login:

```
Email:    demo@example.com
Password: password123
```

> Prefer an interactive migration workflow while developing? Use
> `npm run db:migrate` instead of `db:deploy`.

### 4. Run the web app

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. Run the mobile app

See [mobile/README.md](mobile/README.md). In short:

```bash
cd mobile
npm install
cp .env.example .env     # set EXPO_PUBLIC_API_URL to your backend
npm start
```

---

## API reference

All `/api/notes` endpoints require authentication and only ever operate on the
caller's own notes. Auth is accepted **either** as a NextAuth session cookie
(web) **or** an `Authorization: Bearer <token>` header (mobile).

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | — | `{ email, password, confirmPassword }` | Create an account |
| POST | `/api/auth/login` | — | `{ email, password }` | Returns `{ token, user }` (mobile) |
| `*` | `/api/auth/[...nextauth]` | — | — | NextAuth web session endpoints |
| GET | `/api/notes` | ✅ | — | List the current user's notes |
| POST | `/api/notes` | ✅ | `{ title, content }` | Create a note |
| PUT | `/api/notes/:id` | ✅ | `{ title, content }` | Update a note you own |
| DELETE | `/api/notes/:id` | ✅ | — | Delete a note you own |

### Validation rules

- **Register**: email required & valid; password ≥ 6 chars; passwords must match.
- **Login**: email & password required.
- **Note**: title required (≤ 200 chars); content optional (≤ 20,000 chars).

### Security notes

- Passwords are hashed with bcrypt (cost 10) — never stored in plain text.
- Note routes verify both authentication **and** ownership before any read/write
  (`note.userId === currentUserId`), returning `404` for notes that aren't yours.
- All inputs are validated with [zod](https://zod.dev) on the server.
- Prisma is used for all queries (parameterized — no raw string SQL).

---

## Deploying to production

### Database — Neon

1. Create a project at [neon.tech](https://neon.tech) and copy the pooled
   connection string.

### Web + API — Vercel

1. Push this repo to GitHub and import it into [Vercel](https://vercel.com).
2. Add Environment Variables in the Vercel project settings:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your deployed URL, e.g. `https://your-app.vercel.app`
3. Deploy. The build command (in `vercel.json`) runs
   `prisma generate && prisma migrate deploy && next build`, so migrations are
   applied automatically on each deploy.

### Mobile

Point the mobile app's `EXPO_PUBLIC_API_URL` at your Vercel URL, then build an
APK with EAS (see [mobile/README.md](mobile/README.md)).

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Create/apply a dev migration |
| `npm run db:deploy` | Apply migrations (CI / production) |
| `npm run db:seed` | Seed the demo user + notes |
| `npm run db:studio` | Open Prisma Studio |
