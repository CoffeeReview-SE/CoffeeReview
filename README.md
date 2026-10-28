# SaigonCoffee

SaigonCoffee is a workspace for a coffee shop discovery and review product focused on Ho Chi Minh City. The repository is organized as a pnpm and Turborepo monorepo, with frontend apps, shared packages, and independently deployable backend services.

## Repository structure

- `apps/web` — customer website placeholder
- `apps/main.jsx` — Vite entry point for the four current UI screens
- `apps/App.jsx` — React Router route definitions
- `apps/admin` — administration interface
- `packages/ui` — shared UI components and design system
- `packages/i18n` — locale resources and text-to-speech integration
- `packages/api-client` — generated API client and query hooks
- `packages/types` — shared TypeScript types
- `packages/config` — shared lint, formatting, and TypeScript configuration
- `services/` — gateway, identity, catalog, reviews, submissions, localization, media, and analytics services
- `backend/` — existing .NET API and test project scaffold, retained until its service boundaries are extracted
- `infrastructure/` — Docker, deployment, database scripts, and seed data
- `tools/` — API code generation and i18n extraction utilities
- `docs/` — architecture, ADRs, product requirements, and API documentation
- `features/` — feature planning placeholders retained from the original project scaffold

The application and service directories are currently scaffolds. The existing product documents are in `docs/`.

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- .NET SDK 10 for the local backend services

## Getting started

```sh
npm install
```

Copy `.env.example` to `.env`, set a real `ConnectionStrings__Supabase` and a private `Gateway__SharedKey`, then start the complete local stack:

```sh
npm run dev:stack
```

Open `http://localhost:8080`. The command starts Vite, the catalog service, localization service, and gateway; press `Ctrl+C` to stop them. Apply the existing SQL files in `infrastructure/Database` to Supabase before using database-backed pages.

For frontend-only work, use `npm run dev`. Backend services can also be built and run independently.

To run the frontend with the catalog, localization, and gateway services together, configure `ConnectionStrings__Supabase` and a private `Gateway__SharedKey` in `.env`, then run:

```sh
npm run dev:stack
```

Open `http://localhost:8080`. Press `Ctrl+C` to stop the services. This command does not run database migrations; apply the SQL files in `infrastructure/Database` to the Supabase project first.

## Workspace commands

```sh
npm run build
npm run lint
npm run typecheck
```

## License

See `LICENSE` when a license is selected.
