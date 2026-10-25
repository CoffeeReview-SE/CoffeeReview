# SaigonCoffee

SaigonCoffee is a workspace for a coffee shop discovery and review product focused on Ho Chi Minh City. The repository is organized as a pnpm and Turborepo monorepo, with frontend apps, shared packages, and independently deployable backend services.

## Repository structure

- `apps/web` — customer website
- `apps/mobile` — React Native / Expo app
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
- pnpm 9
- .NET SDK matching the backend project once its project files are added

## Getting started

```sh
pnpm install
pnpm dev
```

Individual app and package scripts become available as their implementations are added. Backend services remain independently buildable and deployable; `backend/` is the current .NET starting point.

Copy `.env.example` to `.env` and set the values needed for local development. Never commit populated secrets.

## Workspace commands

```sh
pnpm build
pnpm lint
pnpm typecheck
```

## License

See `LICENSE` when a license is selected.
