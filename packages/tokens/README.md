# @simple-prism/tokens

> 把 Prism 主题导出为 W3C/DTCG 设计令牌 JSON —— Style Dictionary / Tokens Studio 就绪。

[Prism](https://github.com/Azir-11/Prism) 的设计令牌适配器。

## 安装

```bash
npm i @simple-prism/core @simple-prism/tokens
```

## 用法

```ts
import { generateTheme } from "@simple-prism/core";
import { toDesignTokens, toDesignTokensJson } from "@simple-prism/tokens";

const json = toDesignTokensJson(generateTheme({ primary: "#3b82f6" }));
```

- `color.<外观>.<色板>.<台阶>`：标准 DTCG color token，`$value` 用 hex，源 `oklch()` 存入 `$extensions`；
- `semantic.<外观>.<令牌>`：以 DTCG 别名（`{color.light.primary.on-solid}`）引用色阶，SD / Tokens Studio 可原生解析；
- `light` / `dark` 双集。

MIT · [文档](https://github.com/Azir-11/Prism)
