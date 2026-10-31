# WorkNest backend on Vercel

Create a separate Vercel project from this repository with these settings:

- **Root Directory:** `project/server`
- **Framework Preset:** Express
- **Include source files outside of the Root Directory in the Build Step:** enabled
- Keep the framework's default build and output settings. Do not use the frontend's Vite build command.

The outside-source setting is required for `../shared/catalog/products.ts`.
Deploy from the Git repository so the shared folder is available; uploading only
the `server` folder omits the catalog. Prices remain defined once in the shared
catalog and are used by both applications.

`index.ts` loads configuration, creates Stripe, and default-exports the Express
application for Vercel without opening a port. `createApp.ts` is the application
factory; keep its name distinct from Vercel's automatically detected `app.ts`
entry point. `local.ts` imports the exported app and calls `app.listen()` for
local development. The checkout routes remain `/api/checkout/create-session`
and `/api/checkout/session/:sessionId`.

## Environment

Set these variables in the Vercel backend project's environment settings:

- `STRIPE_SECRET_KEY`: your Stripe sandbox `sk_test_...` secret key
- `CLIENT_URL`: the frontend's full origin for the relevant deployment environment
- `PORT`: optional; local development defaults to `4242`

Do not prefix the secret key with `VITE_` or put it in frontend code. Production
URLs are supplied through environment settings rather than committed to source.

For local development, copy `project/.env.example` to `project/.env` and replace
the secret-key placeholder. The existing entry point intentionally reads this
parent `.env` file, while deployed environment variables are used directly on
Vercel. The real `.env` remains ignored by Git.

## Local commands

The existing `npm run dev` command in `project/` still starts frontend and backend
together, with the backend on port `4242`. To work with the backend separately,
run these commands from `project/server/`:

```sh
npm ci
npm run dev
npm run typecheck
npm test
```

This preparation does not change the frontend's relative `/api` requests. A
separately deployed frontend still needs its hosting proxy to forward `/api` to
the deployed backend; that routing configuration is outside this change.

References: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
and [shared source files in monorepos](https://vercel.com/docs/monorepos/monorepo-faq).
