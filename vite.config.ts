import { fileURLToPath } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // Set only in the GitHub Pages CI build (project subpath, e.g. /print-template/).
  // Unset locally → serves at root, so dev and tests are unaffected.
  base: process.env.BASE_PATH ?? "/",
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["noook", "noook.tsl"],
  },
});
