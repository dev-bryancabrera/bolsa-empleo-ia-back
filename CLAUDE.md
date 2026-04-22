# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development with nodemon (auto-reload)
npm start            # Production mode

npx eslint src/      # Lint source code
npx eslint --fix .   # Auto-fix linting issues
npx prettier --write . # Format code

npm test                              # Run all tests
npm test -- path/to/test.test.js     # Run a single test file
npm test -- --watch                  # Watch mode
```

> Tests and lint are not wired to npm scripts — run via `npx` or `npm test` directly.

## Architecture

This is a **Node.js + Express 5** REST API following **Clean Architecture** with a modular domain structure.

### Layer structure (per module)

Each domain module under `src/lib/{Module}/` has three layers:

- **Domain** (`domain/`) — Pure JS entities and abstract repository interfaces. No framework dependencies.
- **Application** (`application/use-cases/`) — Use case classes with an `execute(dto)` method. Orchestrate domain entities and repositories.
- **Infrastructure** (`infrastructure/`) — Sequelize repository implementations, Express controllers/routes.

Module entry point (`index.js`) wires dependencies: instantiates repositories → use cases → controllers → registers routes with the Express app.

### Shared infrastructure

- `src/infrastructure/models/` — All Sequelize models. `index.js` defines associations.
- `src/infrastructure/database/ConnectMySQL.js` — Sequelize setup + seeder that creates the default admin on first run.
- `src/infrastructure/services/` — External service adapters: `GroqService.js` (active LLM), `OpenIAService.js`, `passport.js` (Google OAuth2).
- `src/middleware/auth.js` — JWT verification (`auth`) and role check (`esAdmin`) middleware.

### App bootstrap

`src/index.js` → connects MySQL → syncs Sequelize models (with `alter: true`) → builds Express app (`src/lib/app.js`) → starts server on `APP_PORT` (default 5132).

`src/lib/app.js` configures middleware (JSON, CORS, Helmet, Passport) and mounts all module routers.

### Domain modules

| Module | Routes prefix | Purpose |
|---|---|---|
| Administracion | `/api/auth`, `/api/admin` | Auth (JWT + Google OAuth2), user CRUD |
| Persona | `/api/persona` | Person profiles |
| CV | `/api/cv`, `/api/habilidades` | CVs and skills |
| Chatbot | `/api/chat`, `/api/conversacion` | AI-powered chat using Groq |
| Tendencias | `/api/tendencias` | AI trend analysis |

### AI integration

`GroqService.js` uses the `llama-3.3-70b-versatile` model (via `GROQ_API_KEY`). It powers both the chatbot conversation flow and trend analysis. OpenAI SDK is installed but not actively used.

## Code Conventions

- **CommonJS** (`require`/`module.exports`) throughout — no ES modules.
- **Spanish terminology** for domain names, variable names, and method names (`crear`, `listar`, `obtener`, `actualizar`, `eliminar`).
- **snake_case** for DB fields (`underscored: true` on Sequelize models), **camelCase** for JS.
- Controllers use **arrow function methods** to preserve `this` binding; use cases use regular `async execute()`.
- `_toEntity()` method on each repository converts Sequelize model instances to domain entities.
- All async controller methods wrap logic in try/catch and call `next(error)` on failure.

## Environment Variables

Key variables required in `.env`:

```
DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT   # MySQL
APP_PORT                                           # Server port (default 5132)
JWT_SECRET, JWT_EXPIRES_IN                        # Auth
GROQ_API_KEY                                      # LLM (required for chatbot/trends)
ADMIN_EMAIL, ADMIN_PASSWORD                       # Seeded default admin
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL  # OAuth2
SMTP_USER, SMTP_PASS                              # Email (password recovery)
FRONTEND_URL                                      # CORS origin
```
