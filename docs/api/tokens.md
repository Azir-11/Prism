---
title: "@simple-prism/tokens"
---

# @simple-prism/tokens

把 `PrismTheme` 导出为 **W3C/DTCG 设计令牌** JSON —— 可直接喂给 Style Dictionary、Tokens Studio、Figma 令牌插件等严肃的令牌流水线。纯函数，仅类型依赖 `@simple-prism/core`。

## toDesignTokens

```ts
function toDesignTokens(theme: PrismTheme, options?: TokensOptions): Record<string, unknown>;
```

产出一棵 DTCG 令牌树：

- `color.<外观>.<色板>.<台阶>` —— 每个都是标准 DTCG color token（`$type: "color"`、`$value` 为 hex），源 `oklch()` 存放在 `$extensions["com.prism.oklch"]`，不丢失感知信息；
- `semantic.<外观>.<令牌>` —— 以 **DTCG 别名**（`{color.light.primary.on-solid}`）引用色阶，Style Dictionary / Tokens Studio 能原生解析这些引用。

```ts
import { generateTheme } from "@simple-prism/core";
import { toDesignTokens } from "@simple-prism/tokens";

const tokens = toDesignTokens(generateTheme({ primary: "#3b82f6" }));
```

```jsonc
{
  "$description": "Prism design tokens (generator v0.1.0)",
  "color": {
    "light": {
      "primary": {
        "500": {
          "$type": "color",
          "$value": "#3b82f6",
          "$extensions": { "com.prism.oklch": "oklch(0.637 0.208 259.8)" },
        },
        // 50…950, text, text-contrast, on-solid …
      },
      // neutral, secondary, error …
    },
    "dark": {
      /* … 暗色台阶 … */
    },
  },
  "semantic": {
    "light": {
      "background": { "$type": "color", "$value": "{color.light.neutral.50}" },
      "primary-foreground": { "$type": "color", "$value": "{color.light.primary.on-solid}" },
    },
    "dark": {
      /* … */
    },
  },
}
```

> **为什么 `$value` 是 hex？** Style Dictionary / Tokens Studio 对 OKLCH 的支持仍不均衡，hex 是最稳的通用回退；OKLCH 原值保留在 `$extensions` 里，需要感知均匀操作时随取随用。

### TokensOptions

| 选项          | 类型     | 默认                    | 说明                  |
| ------------- | -------- | ----------------------- | --------------------- |
| `description` | `string` | `Prism design tokens …` | 顶层 `$description`。 |

## toDesignTokensJson

```ts
function toDesignTokensJson(theme: PrismTheme, options?: TokensOptions): string;
```

等价于 `JSON.stringify(toDesignTokens(theme, options), null, 2)` —— 直接落盘或走剪贴板。
