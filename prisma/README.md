# Prisma (deprecated)

This folder is intentionally kept as a placeholder to document the retirement of Prisma in this repository.

Key points:

- The site is static (Astro SSG) and builds from `src/data/*.json`.
- No database is required for build or deploy.
- `tsconfig.json` excludes the `prisma/` directory from type checking.
- `src/lib/db.ts` and `prisma/seed.ts` are no-op placeholders with deprecation notes.

Please do not:

- Add `@prisma/client` back into the SSG path.
- Import Prisma from files under `src/`.

If you need a database in the future:

- Implement it in a separate backend service or serverless API.
- Keep SSG isolated from any runtime DB access.
