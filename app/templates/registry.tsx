import type { TemplateRender } from "./types";
import { envelope10 } from "./envelope-10";

/**
 * id → renderable template. Add new templates here (and to `manifest.ts`).
 */
const templates: Record<string, TemplateRender> = {
  [envelope10.id]: envelope10,
};

export function getTemplate(
  id: string | undefined,
): TemplateRender | undefined {
  return id ? templates[id] : undefined;
}
