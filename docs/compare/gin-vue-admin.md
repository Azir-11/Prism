---
title: 对比 gin-vue-admin
---

<script setup>
import { ginVueAdmin } from "../.vitepress/data/compare/gin-vue-admin";
</script>

# Prism vs gin-vue-admin

::: info 本页口径
数据基于 **gin-vue-admin v2.9.2**（2026-05-26）与其运行时默认主色 `#3b82f6`；Prism 对同一输入实时生成。编写日期 2026-07-10。
:::

gin-vue-admin 前端基于 Element Plus，但它的主色阶**不是** Element Plus 官方的 `mix(白/黑)`，而是 `web/src/utils/format.js` 里**自写的线性 RGB 插值**：亮档朝 `[240,248,255]`（≈aliceblue）混，写进 `--el-color-primary-light-1..10`。

<ScaleCompare :framework="ginVueAdmin" />

## 差异在哪

- **只有更浅、没有更深**：亮色模式下 `light-1..10` 全部**不深于**主色——这套「色阶」本质是单向提亮。于是它**没有** Prism 600–950 那样可作强边框、强表面、正文的深色端。
- **别被「均匀度」误读**：正因为整条阶被压在很窄的明度区间里，它的「明度节奏均匀度 (CV)」反而看着更低——但**窄而匀不等于覆盖全域还匀**。真正要看的是下一条：可用对比度。
- **正文可读性受限**：因为缺深色端，拿它当正文只能用主色 `#3b82f6` 本身压浅底，对比度上限有限——见「最深压最浅 · APCA / WCAG」，其 WCAG 甚至**够不到 AA 4.5:1**。Prism 额外求解出 `text`/`textContrast` 别名，任意色相都达标。
- **最浅档近乎纯白**：`light-10 = #F0F8FF` 几乎是白，作背景与纯白难分。

## 暗色与语义色

- **暗色**：{{ ginVueAdmin.darkNote }}
- **语义色**：{{ ginVueAdmin.semanticNote }}

注意：主色走自写插值、语义色走 Element Plus 的 `mix`，是**两套不同算法**并存。Prism 用同一套引擎统一主色、语义色与亮暗。

## 小结

gin-vue-admin 贴合 Element Plus 生态、依赖轻；但其主色「色阶」是无深色端的单向提亮、且非感知均匀。Prism 提供完整的 50–950 双端色阶、角色合约与求解出的对比度。

::: tip 想直接换掉这套调色？
新版 gin-vue-admin 已迁到 UnoCSS + `rgb(var(--x-color))` 惯用法，可**零 shim** 接入 Prism：UnoCSS 项目用 [`@simple-prism/unocss`](/api/unocss) 的 `presetPrism`；只需裸通道变量的项目用 [`@simple-prism/css`](/api/css) 的 `format: 'rgb-channels'` + `suffix: 'color'`。50–950 编号与 `primary/info/success/warning/error` 角色名两边天然对齐。
:::
