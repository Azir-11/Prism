import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@simple-prism/core": resolve(root, "packages/core/src/index.ts"),
      "@simple-prism/css": resolve(root, "packages/css/src/index.ts"),
      "@simple-prism/tailwind": resolve(root, "packages/tailwind/src/index.ts"),
    },
  },
  test: {
    include: ["packages/*/test/**/*.test.ts", "playground/test/**/*.test.ts"],
    environment: "node",
  },
});
