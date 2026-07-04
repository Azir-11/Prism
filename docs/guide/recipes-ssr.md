---
title: SSR 无闪暗色
---

# SSR 无闪暗色（Next.js / Nuxt / SvelteKit）

服务端渲染有一个经典陷阱：服务端先吐出**浅色**的 HTML，客户端 JS 加载后才把 `<html>` 切成 `.dark`——中间会闪过一帧白屏（FOUC）。这一节给出根治办法。

## 为什么 Prism 不会加剧这个问题

Prism 的产物是**纯静态**的两段 CSS：

```css
:root {
  /* 浅色阶 + 语义令牌 */
}
.dark {
  /* 暗色阶重定义同一批变量 */
}
```

切换主题**不需要**重新生成任何东西，只要在 `<html>` 上加/去一个 `.dark` 类。所以问题只剩一个：**在首帧绘制之前就把这个类设对**。

## 方案：首绘前的阻塞内联脚本

在 `<head>` 里放一段**同步**内联脚本，它在浏览器解析到 `<body>` 之前执行，读取用户偏好（localStorage 优先，回退到系统 `prefers-color-scheme`），抢在 hydration 前把类设好：

```html
<script>
  (function () {
    try {
      var saved = localStorage.getItem("theme");
      var dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", dark);
    } catch (e) {}
  })();
</script>
```

关键在于它是**同步**的——不要用 `defer`/`async`，也不要放进框架的客户端组件里，否则又会晚一帧。

## Next.js（App Router）

把脚本放进根 `layout.tsx` 的 `<head>`，并给 `<html>` 加 `suppressHydrationWarning`（因为服务端与客户端的 class 会不一致，这是预期内的）：

```tsx
// app/layout.tsx
import "./globals.css"; // 里面 @import 或粘贴了 Prism 生成的 :root/.dark

const noFlash = `(function(){try{var s=localStorage.getItem('theme');
var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Nuxt / SvelteKit

- **Nuxt**：用 `app.head` 里的 `script`（`tagPosition: 'head'`）或 `nuxt-app` 插件注入同一段脚本；也可以直接写进 `app.html`。
- **SvelteKit**：把脚本粘进 `src/app.html` 的 `<head>`（在 `%sveltekit.head%` 之前）。

## 落地清单

1. 生成一次主题并把 CSS 提交进仓库：

   ```ts
   import { generateTheme } from "@simple-prism/core";
   import { toCssVariables } from "@simple-prism/css";

   // build 脚本里跑一次，写入 app/globals.css
   const css = toCssVariables(generateTheme({ primary: "#3b82f6" }));
   ```

2. 在 `<head>` 注入上面的阻塞脚本。
3. 你的主题切换按钮只做两件事：`classList.toggle('dark')` + `localStorage.setItem('theme', …)`。

至此，暗色在服务端首帧就已正确，**零闪烁**。相关背景见 [暗色模式：镜像明度阶](./dark-mode)。
