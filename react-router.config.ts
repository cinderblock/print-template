import type { Config } from "@react-router/dev/config";
import { templateIds } from "./app/templates/manifest";

export default {
  ssr: false,
  // Set only in the Pages CI build (project subpath, e.g. /print-template/);
  // unset locally so dev/tests run at root. Prerendered pages are emitted under
  // this prefix; the deploy workflow flattens them to the artifact root.
  basename: process.env.BASE_PATH ?? "/",
  async prerender() {
    return ["/", "/addresses", ...templateIds.map((id) => `/template/${id}`)];
  },
} satisfies Config;
