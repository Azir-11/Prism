import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      "@prism/core": src("../packages/core/src/index.ts"),
      "@prism/css": src("../packages/css/src/index.ts"),
      "@prism/tailwind": src("../packages/tailwind/src/index.ts"),
    },
  },
  server: {
    port: 5173,
  },
});
