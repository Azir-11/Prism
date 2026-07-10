---
title: 对比 soybean-admin
---

<script setup>
import { soybean } from "../.vitepress/data/compare/soybean";
</script>

# Prism vs soybean-admin

::: info 本页口径
数据基于 **soybean-admin v2.2.0**（2026-05-13）与其默认主色 `#646cff`；Prism 对同一输入实时生成。编写日期 2026-07-10。换版本或换输入色，结论可能变化。
:::

soybean-admin 的主色阶由内置的 `@sa/color` 生成，算法是 **Ant Design 的 generate**：在 HSV 空间里，以固定步长对色相/饱和度/明度增减，主色钉在 500。这套算法成熟、稳健，被大量项目沿用。

<ScaleCompare :framework="soybean" />

## 差异在哪

- **感知均匀性**：antd 在 **HSV** 空间步进，而 HSV 的明度不是感知明度。上面的「明度节奏均匀度」指标反映了这点——OKLCH 里各阶的明度跳变不如 Prism 平滑。
- **极端明度种子会塌陷相邻阶**：`#646cff` 的 HSV 明度已达 100，最浅的 **50 与 100 收敛为同一色 `#F0F3FF`**——两阶失去区分。Prism 用手工调校的明度阶 + 种子钉定，单调性不被破坏，不会塌陷。
- **色相扭转**：antd 有意让色相随明度漂移（提亮偏暖、压暗偏冷），漂移量通常大于 Prism 默认的 ~4° 扭转；风格取向不同，谈不上谁对谁错，指标里如实呈现。

## 暗色与语义色

- **暗色**：{{ soybean.darkNote }}
- **语义色**：{{ soybean.semanticNote }}

Prism 则把亮/暗放在**同一套角色合约**下——暗色是镜像明度阶而非另起一套，语义色由同一色阶引擎派生，正文/强调/实底前景以 APCA 求解。

::: tip 小结
antd 算法成熟可靠；Prism 的取向是**感知均匀 + 种子钉定不塌陷 + 求解出的对比度**。
:::
