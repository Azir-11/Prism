import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import PrismPalette from "./PrismPalette.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("PrismPalette", PrismPalette);
  },
} satisfies Theme;
