import type { Config } from "@react-router/dev/config";
import { templateIds } from "./app/templates/manifest";

export default {
  ssr: false,
  // Enumerate explicit paths so each template page is prerendered to static
  // HTML (the splat 404 route is served via the SPA fallback).
  async prerender() {
    return ["/", ...templateIds.map((id) => `/template/${id}`)];
  },
} satisfies Config;
