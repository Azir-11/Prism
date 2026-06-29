import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  lang: "zh-CN",
  title: "Prism",
  description: "一种颜色，一整套和谐的主题 —— OKLCH-first、APCA 对比度求解的设计令牌生成器。",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpolygon points=%2250,10 90,80 10,80%22 fill=%22none%22 stroke=%22%233b82f6%22 stroke-width=%226%22/%3E%3C/svg%3E",
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: "指南", link: "/guide/what-is-prism", activeMatch: "/guide/" },
      { text: "API", link: "/api/core", activeMatch: "/api/" },
      { text: "设计哲学", link: "/guide/philosophy" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "开始",
          items: [
            { text: "Prism 是什么", link: "/guide/what-is-prism" },
            { text: "快速上手", link: "/guide/getting-started" },
          ],
        },
        {
          text: "理念 · 色彩美学",
          items: [
            { text: "设计哲学", link: "/guide/philosophy" },
            { text: "为什么是 OKLCH", link: "/guide/oklch" },
            { text: "色阶与角色合约", link: "/guide/scale" },
            { text: "调和：从一到多", link: "/guide/harmony" },
            { text: "对比度：求解而非祈祷", link: "/guide/contrast" },
            { text: "暗色模式", link: "/guide/dark-mode" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API 参考",
          items: [
            { text: "@prism/core", link: "/api/core" },
            { text: "@prism/css", link: "/api/css" },
            { text: "@prism/tailwind", link: "/api/tailwind" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/Azir-11/Prism" }],
    footer: {
      message: "基于 MIT 许可发布",
      copyright: "© 2026 青菜白玉汤",
    },
    outline: { label: "本页大纲", level: [2, 3] },
    docFooter: { prev: "上一篇", next: "下一篇" },
    darkModeSwitchLabel: "外观",
    returnToTopLabel: "回到顶部",
    lastUpdatedText: "最后更新",
  },
  vite: {
    resolve: {
      alias: {
        "@prism/core": src("../../packages/core/src/index.ts"),
        "@prism/css": src("../../packages/css/src/index.ts"),
        "@prism/tailwind": src("../../packages/tailwind/src/index.ts"),
      },
    },
  },
});
