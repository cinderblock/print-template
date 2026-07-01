import type { TemplateRender } from "./types";
import { envelopeTemplates } from "./envelopes";

/**
 * id → renderable template. Add new templates by including them here (and their
 * metadata in `manifest.ts`).
 */
const templates: Record<string, TemplateRender> = Object.fromEntries(
  envelopeTemplates.map((t) => [t.id, t]),
);

export function getTemplate(
  id: string | undefined,
): TemplateRender | undefined {
  return id ? templates[id] : undefined;
}
