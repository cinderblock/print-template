# Print Template

Print onto physical media — **envelopes, labels, and more** — straight from your browser.
Fill in a few fields, get a true-to-size print. Your addresses are saved only on your device
(localStorage); nothing is uploaded.

Built on [`cinderblock/ssg-base`](https://github.com/cinderblock/ssg-base) (React Router 7 SSG +
Vite + TypeScript + Bun).

## Templates

| Template     | Media                            | Status  |
| ------------ | -------------------------------- | ------- |
| #10 Envelope | 9.5 × 4.125 in business envelope | ✅      |
| Avery labels | sheet label grids                | planned |

## How it works

- Each template declares a **paper size** (in inches), a set of **fields**, and a **Preview**
  component that renders the printable layout.
- `PrintArea` shows the preview true-to-size (scaled to fit on screen) and injects an
  `@page { size: <w> <h>; margin: 0 }` rule so it prints at exact physical dimensions.
- Envelopes remember your **return ("from") address** and keep an **address book** of recently
  used **delivery ("to") addresses** — all in `localStorage`.

## Add a template

1. Create `app/templates/<id>/index.tsx` exporting a `TemplateRender` (`id`, `paper`, `fields`,
   `Preview`). Co-locate any CSS (e.g. `<id>/styles.css`).
2. Register it in `app/templates/registry.tsx`.
3. Add its metadata to `app/templates/manifest.ts` (drives the gallery + prerendered routes).

## Develop

```sh
bun install
bun run dev        # http://localhost:5173
```

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `bun run dev`       | Dev server                          |
| `bun run build`     | Build static site to `build/client` |
| `bun run preview`   | Preview the production build        |
| `bun run test`      | Playwright tests                    |
| `bun run typecheck` | Type check                          |
| `bun run fmt`       | Format with oxfmt                   |

## Deploy

`.github/workflows/deploy.yml` builds and publishes to **GitHub Pages** on every push to `master`
(format check → tests → typecheck → build). The site is a project page at
`https://<owner>.github.io/print-template/`.

The subpath is wired via a `BASE_PATH` env var that is set **only in CI**, so local dev and tests
still run at root. React Router emits prerendered pages under the basename dir; the workflow
flattens them to the artifact root and adds a `404.html` SPA fallback. To build the subpath layout
locally: `BASE_PATH=/print-template/ bun run build`. See `plans/print-template.md`.
