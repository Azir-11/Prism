import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      "@simple-prism/core": src("../packages/core/src/index.ts"),
      "@simple-prism/css": src("../packages/css/src/index.ts"),
      "@simple-prism/scss": src("../packages/scss/src/index.ts"),
      "@simple-prism/tailwind": src("../packages/tailwind/src/index.ts"),
      "@simple-prism/tokens": src("../packages/tokens/src/index.ts"),
    },
  },
  server: {
    port: 5173,
  },
});
