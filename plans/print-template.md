# print-template — plan

Plan path: `plans/print-template.md`

## Goal

A generic static site for **printing onto physical media** — envelopes first, then Avery labels,
etc. Each template exposes editable fields and a precise print layout (correct paper/@page size).
Repo to become **`cinderblock/print-template`**, hosted as a static site. Based on
**`cinderblock/ssg-base`** (React Router 7 SSG + Vite + Bun + TS).

## Decisions made

- Base: `cinderblock/ssg-base` (cloned, git history re-initialized, ssg-base remote removed).
- Build locally first; do NOT create/push the GitHub repo until user gives the go-ahead.
- Deps: update to latest stable.
- First template: **#10 envelope** (9.5×4.125in) — from/to addresses.
- Persistence: browser **localStorage** — a saved default **from** address, and an **address book**
  of recently-used **to** addresses (pick from recents; offer to save new ones).

## Open decisions

1. **Deploy target.** ssg-base ships a **Cloudflare Pages** GitHub Action (`.github/workflows/deploy.yml`).
   User originally said **GitHub Pages**. These differ: GH Pages _project_ site serves under
   `/print-template/` (needs Vite `base`) and a different workflow; Cloudflare Pages serves at root.
   → CONFIRM with user before wiring deploy. App code is deploy-agnostic, so build first.
2. Repo visibility (GH Pages free needs public; content is non-sensitive → public is fine).

## Architecture

```
app/
  templates/
    types.ts          — Template + Field type defs
    manifest.ts       — pure-data list of templates (id/name/desc/category) for routing & gallery
    registry.tsx      — id → React template module (fields + Preview + paper size)
    envelope-10/index.tsx
  lib/
    storage.ts        — localStorage: fromAddress + address book (recent to-addresses)
  components/
    PrintArea.tsx     — isolates the printable node, injects @page size, window.print()
    AddressField.tsx  — multiline address input w/ "save to book" + recents picker
  routes/
    home.tsx          — gallery of templates (from manifest)
    template.tsx      — /template/:id — editor (fields) + live preview + Print button
    404.tsx
  routes.ts           — index + /template/:id + 404
react-router.config.ts — prerender ["/", each /template/:id, 404]
```

## Print approach

- On screen: show the template at true size (inches→CSS in) inside a "paper" card, plus the field editor.
- On print: `@media print` hides the app chrome; only the `.print-area` shows; a per-template
  `@page { size: <w> <h>; margin: 0 }` is injected so it lands correctly on the physical media.

## Progress log

- [x] Clone ssg-base, re-init git, write this plan
- [x] Update deps to latest stable (RR 8, Vite 8, TS 6 — needed a fontsource d.ts shim + a Vite `~` alias)
- [x] Rename package.json → print-template; update README
- [x] Build template framework (types, manifest, registry, PrintArea, storage, AddressField)
- [x] Envelope #10 template
- [x] Home gallery + template route + prerender config
- [x] Verify: typecheck + build + 8 Playwright tests green
- [ ] Decide deploy target with user; wire workflow; (later) push to GitHub + enable Pages

## Findings / gotchas

- TS 6 errors on side-effect import of `@fontsource-variable/inter` (no types) → added
  `app/globals.d.ts` with `declare module`.
- `~/*` works for tsc + the RR build, but the Vite **dev** module runner can't resolve it →
  added an explicit `resolve.alias` for `~` in `vite.config.ts`.
- SSG hydration race: Playwright (or a fast user) can type into the prerendered HTML before React
  hydrates, and React then resets the controlled field. Fix: root sets `html[data-hydrated]` in a
  `useEffect`; tests wait for it before interacting. Retrying the fill alone was NOT enough.

## Things not to do

- Don't push to the ssg-base remote (it was removed; keep it that way).
- Don't put real personal addresses in committed code — they live only in the user's localStorage.
