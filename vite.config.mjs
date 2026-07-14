import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Builds djsuperadmin/static/djsuperadmin/djsuperadmin.bundle.js: a single
// self-executing (IIFE) script that the {% djsuperadminjs %} template tag
// inlines into the page. It lives under static/ so Django's app-directories
// staticfiles finder also serves it at /static/djsuperadmin/djsuperadmin.bundle.js
// — headless (SPA/SSR) frontends load it from there. SCSS is compiled and
// injected at runtime from within this same bundle (see djsuperadmin/src/index.js),
// so no separate CSS file is emitted.
export default defineConfig({
  build: {
    outDir: "djsuperadmin/static/djsuperadmin",
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
