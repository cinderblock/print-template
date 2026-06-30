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

Static output lands in `build/client/` — host on any static host. The included GitHub Action
(`.github/workflows/deploy.yml`, inherited from ssg-base) targets **Cloudflare Pages**; switch to
GitHub Pages by swapping the workflow and setting Vite's `base` if served from a subpath.
See `plans/print-template.md`.
