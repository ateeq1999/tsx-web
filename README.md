# tsx-web

Monorepo for the **tsx** registry web platform — the web frontend and documentation site for the [tsx CLI](https://github.com/ateeq1999/tsx), a universal code-pattern registry for TanStack Start projects.

## What is tsx?

tsx is a CLI tool and open registry for **reusable code patterns**. Think of it like shadcn/ui, but for complete patterns — auth flows, CRUD with TanStack Query, Drizzle ORM setups, role-based access, and more.

```bash
# Install a full Better Auth integration into your TanStack Start project
tsx install with-auth
```

This repo contains two apps:

| App | Description | URL |
|-----|-------------|-----|
| `apps/registry-web` | Registry dashboard — browse, publish, and manage packages | https://tsx-registry-web-alpha.vercel.app |
| `apps/docs` | Documentation site for the tsx CLI and FPF specification | https://tsx-docs-nine.vercel.app |

---

## Monorepo Structure

```
tsx-web/
├── apps/
│   ├── registry-web/          # Main registry web app (TanStack Start + SSR)
│   └── docs/                  # Documentation site (TanStack Start + MDX)
├── packages/
│   ├── api-types/             # Shared TypeScript types for the registry backend API
│   └── ui/                    # Shared UI components (Header, Footer, ThemeToggle)
├── scripts/
│   ├── deploy.sh              # Deploy both apps to Vercel
│   └── setup-github-secrets.sh # Configure GitHub Actions secrets
├── package.json               # Root workspace scripts
└── bun.lockb                  # Bun lockfile
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) 1.132 (React 19 + SSR) |
| Routing | TanStack Router 1.132 |
| Server State | TanStack Query (React Query) 5.91 |
| Forms | TanStack Form 1.28 |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) 0.45 |
| Auth | [better-auth](https://better-auth.com) 1.5.5 |
| Styling | Tailwind CSS 4 + shadcn/ui + Radix UI |
| Build | Vite 7 + Nitro (server) |
| Linting | [Biome](https://biomejs.dev) 2.4 |
| Testing | Vitest + Playwright E2E |
| Package Manager | [Bun](https://bun.sh) |
| Deployment | [Vercel](https://vercel.com) (Nitro preset) |

---

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- [Node.js](https://nodejs.org) ≥ 18 (for compatibility)
- PostgreSQL database (for `registry-web`)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/ateeq1999/tsx-web.git
cd tsx-web
bun install
```

### 2. Configure environment variables

#### registry-web

```bash
cp apps/registry-web/.env.example apps/registry-web/.env
```

Edit `apps/registry-web/.env`:

```env
# Registry backend (Rust server)
VITE_REGISTRY_URL=http://localhost:8080

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/tsx_db

# Auth
BETTER_AUTH_SECRET=your-random-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# App URLs
VITE_SITE_URL=http://localhost:3000
VITE_SERVER_URL=http://localhost:3000
VITE_CORS_ORIGIN=http://localhost:3000

# Social OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Set up the database

```bash
cd apps/registry-web
bun run db:push      # Push schema to database
```

### 4. Start development servers

```bash
# From monorepo root

# registry-web on http://localhost:3000
bun run dev:web

# docs on http://localhost:3001
bun run dev:docs
```

---

## Available Scripts

Run from the **monorepo root**:

### Development

```bash
bun run dev:web      # Start registry-web dev server (port 3000)
bun run dev:docs     # Start docs dev server (port 3001)
```

### Building

```bash
bun run build:web    # Build registry-web with Vercel Nitro preset
bun run build:docs   # Build docs with Vercel Nitro preset
```

### Deploying to Vercel

```bash
# Preview deployments
bun run deploy:web
bun run deploy:docs

# Production deployments
bun run deploy:web:prod
bun run deploy:docs:prod
bun run deploy:all:prod   # Build and deploy both apps to production
```

### App-level scripts (run inside `apps/registry-web`)

```bash
bun run typecheck     # TypeScript type check (no emit)
bun run lint          # Biome lint
bun run format        # Biome format
bun run check         # Biome lint + format combined
bun run test          # Vitest unit tests
bun run test:e2e      # Playwright end-to-end tests
```

### Database (run inside `apps/registry-web`)

```bash
bun run db:generate   # Generate Drizzle migration files
bun run db:migrate    # Apply pending migrations
bun run db:push       # Push schema directly to DB (dev only)
bun run db:pull       # Pull schema from DB into Drizzle
bun run db:studio     # Open Drizzle Studio (GUI for the database)
bun run db:clear      # Clear all data from the database
```

---

## Apps

### registry-web

The main registry web application. Full-stack with server-side rendering.

**Key pages:**

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, stats, and featured packages |
| `/browse` | Search and filter all packages |
| `/packages/:name` | Package detail with README, versions, download stats |
| `/auth/login` | Login |
| `/auth/register` | Sign up |
| `/_protected/dashboard` | User dashboard (authenticated) |
| `/_protected/publish` | 4-step package publish wizard |
| `/_protected/account` | Profile, sessions, API keys |
| `/_protected/admin/*` | Admin dashboard (admin role required) |

**Auth system:**

- Email/password with verification flow
- GitHub and Google OAuth (configure via env vars)
- Session tracking with IP/user-agent
- Role-based access: `user` and `admin`
- API key generation for CLI publishing

**Backend:**

registry-web is the frontend for a [Rust registry server](https://github.com/ateeq1999/tsx). The Rust server handles package storage, search, and distribution. Set `VITE_REGISTRY_URL` to point at it.

### docs

The documentation site for the tsx CLI. Built with MDX and Fuse.js full-text search.

**Content structure:**

```
Introduction
  ├── Getting Started
  └── Installation

CLI
  ├── Overview
  ├── tsx install
  ├── tsx search
  ├── tsx info
  ├── tsx framework
  └── tsx stack

Framework Package Format (FPF)
  ├── Overview
  ├── manifest.json reference
  └── Publishing guide

Registry
  ├── Overview
  ├── Self-hosting
  └── API Reference

Resources
  ├── Examples
  ├── Official Packages
  └── Troubleshooting
```

---

## Shared Packages

### `@tsx/api-types`

TypeScript type definitions for the registry backend REST API. Used by both `registry-web` and potentially by CLI tooling.

```ts
import type { Package, SearchResult, RegistryStats } from "@tsx/api-types"
```

### `@tsx/ui`

Shared UI components used across both apps:

```ts
import { ThemeToggle, Footer, BaseHeader } from "@tsx/ui"
```

---

## Deployment

Both apps deploy to [Vercel](https://vercel.com) using the [Nitro Vercel preset](https://nitro.unjs.io/deploy/providers/vercel), which generates Vercel's [Build Output API v3](https://vercel.com/docs/build-output-api/v3) format.

### How it works

1. Build locally with `NITRO_PRESET=vercel bun run build` inside each app directory — this produces `.vercel/output/` with the static assets and SSR server function.
2. Deploy the prebuilt output with `vercel deploy --prebuilt` from the app directory.

This avoids the monorepo root path resolution issues with Vercel's remote build system.

### Vercel project IDs

| App | Project | Org |
|-----|---------|-----|
| registry-web | `prj_TuuSlGG2eGWFpgyr8QeYWd0zm2vj` | `team_ZXYg3N40sVxlvjK3XxEdk21M` |
| docs | `prj_aCHwTqnPA0dNj8qkYzjaDgCYB4tc` | `team_ZXYg3N40sVxlvjK3XxEdk21M` |

### CI/CD

GitHub Actions workflow in [.github/workflows/ci.yml](.github/workflows/ci.yml) runs on every push to `main`:

1. Typecheck (`tsc --noEmit`)
2. Build both apps with the Vercel preset
3. Deploy both to Vercel production

Required GitHub secrets:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | `team_ZXYg3N40sVxlvjK3XxEdk21M` |
| `VERCEL_REGISTRY_WEB_PROJECT_ID` | `prj_TuuSlGG2eGWFpgyr8QeYWd0zm2vj` |
| `VERCEL_DOCS_PROJECT_ID` | `prj_aCHwTqnPA0dNj8qkYzjaDgCYB4tc` |

Set all secrets at once:

```bash
export VERCEL_TOKEN=your_token_here
bash scripts/setup-github-secrets.sh
```

### Required Vercel environment variables

Set these on the `tsx-registry-web` Vercel project (Dashboard → Settings → Environment Variables):

```
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
VITE_REGISTRY_URL
VITE_SITE_URL
VITE_CORS_ORIGIN
```

---

## Contributing

1. Fork the repo and create a branch from `main`.
2. Make changes. Run `bun run check` to lint and format.
3. Open a PR — CI will typecheck and build automatically.

---

## Related

- [tsx CLI](https://github.com/ateeq1999/tsx) — The Rust CLI and registry server
- [TanStack Start](https://tanstack.com/start) — The React SSR framework powering both apps
- [better-auth](https://better-auth.com) — The auth library used in registry-web
- [Drizzle ORM](https://orm.drizzle.team) — The database ORM

---

## License

MIT
