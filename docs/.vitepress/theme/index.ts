import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ComponentPreview from "./ComponentPreview.vue";
import ContrastReport from "./ContrastReport.vue";
import PrismPalette from "./PrismPalette.vue";
import ScaleCompare from "./ScaleCompare.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("PrismPalette", PrismPalette);
    app.component("ContrastReport", ContrastReport);
    app.component("ScaleCompare", ScaleCompare);
    app.component("ComponentPreview", ComponentPreview);
  },
} satisfies Theme;
