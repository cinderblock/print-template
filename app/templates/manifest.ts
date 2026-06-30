import type { TemplateMeta } from "./types";

/**
 * Pure-data list of available templates. Kept free of React imports so it can
 * be imported by `react-router.config.ts` to enumerate prerender paths.
 * The actual renderable modules live in `registry.tsx`, keyed by these ids.
 */
export const templateList: TemplateMeta[] = [
  {
    id: "envelope-10",
    name: "#10 Envelope",
    description:
      "Standard US business envelope (9.5 × 4.125 in) with return and delivery addresses.",
    category: "Envelopes",
  },
];

export const templateIds: string[] = templateList.map((t) => t.id);
