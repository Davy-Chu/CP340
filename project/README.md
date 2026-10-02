# WorkNest

WorkNest is a responsive, frontend-only storefront for workspace accessories. It
is built with React, TypeScript, and Vite. Product, cart, and navigation state
are kept in the browser; no backend, database, accounts, or environment
variables are required.

## Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/) 18 or newer
- npm (included with Node.js)

Confirm the tools are available:

```bash
node --version
npm --version
```

## Run locally

From the `project` directory, install the exact dependency versions recorded in
`package-lock.json`:

```bash
npm ci
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed in the terminal (usually
`http://localhost:5173`). The page reloads automatically when source files
change.

If you are starting from the repository root instead, run:

```bash
cd project
npm ci
npm run dev
```

## Available commands

```bash
npm run dev        # Start the development server
npm run build      # Type-check and create a production build in dist/
npm run preview    # Serve the production build locally
npm run lint       # Run ESLint
npm run typecheck  # Run the TypeScript compiler without building
```

To test the production build locally:

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
├── components/
│   ├── cart/       # Cart drawer UI
│   ├── catalog/    # Reusable product UI
│   └── layout/     # Site header and footer
├── data/           # Static product and image data
├── pages/          # Page-level components
├── styles/         # Base, layout, component, page, and responsive CSS
├── types/          # Shared TypeScript types
├── App.tsx         # Application state and page coordination
└── main.tsx        # Browser entry point
```

## Notes

- The current navigation is client-side state rather than URL-based routing.
- The cart is intentionally temporary and resets when the browser reloads.
- Product photography and web fonts are loaded from external sources, so an
  internet connection is needed for those assets.
- Checkout and journal buttons are presentation-only until backend or content
  services are added.
