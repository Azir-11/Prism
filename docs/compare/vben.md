---
title: 对比 vben5
---

<script setup>
import { vben } from "../.vitepress/data/compare/vben";
</script>

# Prism vs vue-vben-admin (vben5)

::: info 本页口径
数据基于 **vue-vben-admin v5.7.0** 与其默认主色 `hsl(212 100% 45%)`（`#006be6`）；Prism 对同一输入实时生成。编写日期 2026-07-10。
:::

vben5 的主色阶由轻量库 **`theme-colors`** 生成：在**纯 sRGB** 空间做线性 tint（向白混）与 shade（向黑压），主色钉在 500。实现极简、依赖极轻。

<ScaleCompare :framework="vben" />

## 差异在哪

- **线性 sRGB ≠ 感知空间**：在 sRGB 里等比例混色，落到人眼上并不等距。中间调容易发灰、明度节奏不均——见「明度节奏均匀度」。
- **偏深主色导致暗端拥挤**：`#006be6` 本身明度偏低，向黑压的 700–950 迅速挤成近黑窄带（`#00408A → #00152E`），彼此难以区分。Prism 的明度阶按感知间隔铺开，两端仍可辨。
- **两端质量**：向白 tint 的浅端偏灰，向黑 shade 的深端彩度骤降。Prism 用**彩度钟形包络**——峰值在中间调，向两端平滑收敛，避免近白/近黑发脏。

## 暗色与语义色

- **暗色**：{{ vben.darkNote }}
- **语义色**：{{ vben.semanticNote }}

## 小结

vben5 的方案胜在**简单、依赖轻**；代价是线性 sRGB 非感知均匀、偏深主色下暗端拥挤。Prism 在 **OKLCH** 生成、明度阶手工调校、彩度钟形包络，换取更均匀、两端更干净的色阶。
