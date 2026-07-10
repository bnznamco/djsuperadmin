import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Builds djsuperadmin/dist/djsuperadmin.bundle.js: a single self-executing
// (IIFE) script that the {% djsuperadminjs %} template tag inlines into the
// page. SCSS is compiled and injected at runtime from within this same bundle
// (see djsuperadmin/src/index.js), so no separate CSS file is emitted.
export default defineConfig({
  build: {
    outDir: "djsuperadmin/dist",
    emptyOutDir: true,
    target: "es2015",
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL("./djsuperadmin/src/index.js", import.meta.url)),
      name: "djsuperadmin",
      formats: ["iife"],
      fileName: () => "djsuperadmin.bundle.js",
    },
  },
});
