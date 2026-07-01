import type { TemplateMeta } from "./types";
import { envelopeSizes } from "./envelopes/sizes";

/**
 * Pure-data list of templates for routing + the gallery. Kept free of React
 * imports so `react-router.config.ts` can enumerate prerender paths from it.
 */
export const templateList: TemplateMeta[] = envelopeSizes.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  category: "Envelopes",
}));

export const templateIds: string[] = templateList.map((t) => t.id);
