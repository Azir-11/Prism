# Spec: Prism 增加 UnoCSS 一等支持

- 日期: 2026-07-12
- 状态: 已批准，待实现
- 背景: Prism 的核心目标之一是能被使用 UnoCSS/Tailwind 的项目便捷接入。调研 gin-vue-admin 后发现，此类 admin 模板普遍依赖「裸 RGB 通道变量 + `rgb(var(--x) / α)`」惯用法，而 Prism 现有适配器（css/scss/tailwind/tokens）全部只输出带壳色值（`rgb(...)`/`oklch()`/hex），没有裸通道格式，也没有命名配置，导致接入方被迫手写 shim。本 spec 补齐这两个原语，并新增一个 UnoCSS 一等适配层。

## 目标

1. 让任意 `rgb(var())` 惯用法项目（gin-vue-admin / soybean-admin / naive-ui-admin 等）**零 shim** 消费 Prism 输出。
2. 提供 UnoCSS 官方适配层：`toUnoTheme()`（theme 对象生成器）+ `presetPrism()`（一行接入的 UnoCSS 预设）。
3. 同步文档与 playground，保持与其他适配器一致的呈现。

## 非目标（本次不做）

- 全量 `nameTemplate` 回调（YAGNI，`prefix` + `suffix` 已覆盖已知惯用法）。
- 中性/表面语义色到 UnoCSS 的映射增强（可后续单独 PR）。
- gin-vue-admin 本体改造（属 gva 仓库范畴）。
- 发版 / changeset（由维护者手动完成）。

## 架构

下层是上层的复用原语，避免重复造发射器：

```
core:  新增 rgb-channels 格式（裸通道 "59 130 246"）      ← 所有适配器共享
  └ css:   新增命名配置（prefix 可空 / suffix）           ← 复用 rgb-channels
      └ unocss（新包）: toUnoTheme() + presetPrism()       ← 复用 css 出变量
docs + playground 同步
```

## 详细设计

### A. `@simple-prism/core` — 新增 `rgb-channels` 格式

**决策**：把裸通道做成 `ColorFormat` 联合类型的新成员，而非某个适配器的局部选项。理由：css/scss/tailwind 都通过共享的 `ColorFormat` + `formatIn()` 取值，加在联合类型上可让三者一次性获得该能力，契合仓库「单一 format flag 驱动所有输出」的既有哲学。

- `packages/core/src/types.ts`：`ColorFormat` 由 `"oklch" | "hex" | "rgb" | "hsl"` 扩为再加 `"rgb-channels"`。
- `packages/core/src/color.ts`：
  - 新增并导出 `formatRgbChannels(o: Oklch): string`，返回 `` `${r} ${g} ${b}` ``。实现复用 `toSrgb255(o)`，**必须 `Math.round` 每个通道**（`toSrgb255` 返回未取整浮点）。忽略 alpha（裸通道只出 3 段，alpha 由消费侧的 `rgb(var() / α)` 包壳提供）。
  - `formatIn()` 增加 `case "rgb-channels": return formatRgbChannels(o);`。
- `packages/core/src/index.ts`：导出 `formatRgbChannels`。
- 影响面：css/scss/tailwind 的 `value`/`val` 函数走 switch，遇未知 format 落到 `default`（oklch）；需要在这些适配器的 switch 中显式加 `case "rgb-channels"` 或改为委托 `formatIn`，确保裸通道格式在各适配器都真实生效（见 B、C）。

**测试** `packages/core/test/color.test.ts`：

- `formatRgbChannels` 对已知 OKLCH 输出整数三段（如蓝色 → `"59 130 246"` 量级，断言为 `/^\d+ \d+ \d+$/` 且各段 0–255 整数）。
- `formatIn(o, "rgb-channels")` 等价于 `formatRgbChannels(o)`。

### B. `@simple-prism/css` — 命名可配

**决策**：新增 `prefix`（允许空串）+ `suffix` 两个原语，覆盖 gva/soybean/naive 系全部 `rgb(var())` 命名；不做全量回调。

- `packages/css/src/index.ts`：
  - `CssOptions` 新增 `suffix?: string`（默认 `""`）。
  - 变量名生成改为 `--[<prefix>-]<scale>-<step>[-<suffix>]`：
    - `prefix === ""` 时**省略前缀段**（不得产生 `---` 或前导 `-`）。
    - `suffix === ""` 时省略后缀段。
  - `text`/`text-contrast`/`on-solid` 三个附加 swatch 的变量同规则。
  - `refToVar()`（语义层引用）必须用**同一套** prefix/suffix 规则，保证 `var(--…)` 指向真实存在的变量。
  - `value()` switch 增加 `case "rgb-channels"`（或委托 `formatIn`），使裸通道格式生效。
  - `toCssVariableMap()` 同步 prefix/suffix/通道逻辑。
- 目标产物（gva 形状，零 shim）：
  ```css
  /* toCssVariables(theme, { format:'rgb-channels', prefix:'', suffix:'color', semantic:false }) */
  :root {
    --primary-500-color: 59 130 246; /* … */
  }
  .dark {
    --primary-500-color: /* … */;
  }
  ```

**测试** `packages/css/test/css.test.ts`：

- `prefix:''` 不产生 `---` / 前导 `-`。
- `suffix:'color'` 产出 `--primary-500-color`。
- `format:'rgb-channels'` 值形如 `59 130 246`。
- 语义层引用与变量名一致（`var(--primary-500-color)` 能在同输出中找到定义）。
- 既有默认行为（`--prism-primary-500`）保持不变（回归）。

### C. 新包 `@simple-prism/unocss`

**决策**：`presetPrism` 同时接受 `PrismInput`（内部调用 `generateTheme`）与已建好的 `PrismTheme`；preflight 复用 css 适配器的 `toCssVariables` 出变量，不另写发射器。`toUnoTheme` 用 `<alpha-value>` 占位（UnoCSS `@unocss/rule-utils` 的 `alphaPlaceholders = ["%alpha","<alpha-value>"]` 原生支持，已核实源码）。

包结构镜像现有适配器包：

```
packages/unocss/
  package.json        name "@simple-prism/unocss", version 0.1.2, exports 同其他包
  tsconfig.json       继承 tsconfig.base.json
  tsdown.config.ts    同其他适配器
  README.md
  src/index.ts
  test/unocss.test.ts
```

**API**：

- `toUnoTheme(theme: PrismTheme, options?: UnoThemeOptions): { colors: Record<string, string>; boxShadow?: Record<string, string> }`
  - `colors` 用**扁平键**（与 gva `themeVars` 一致）：每个 scale 生成 `name`（= DEFAULT，其值直接引用 500 步的变量）与 `name-<step>`（50…950）。值形如 `rgb(var(--<varname>) / <alpha-value>)`。扁平 `{ primary, 'primary-500' }` 同样支持 `bg-primary` 与 `bg-primary-500`。
  - `<varname>` 由 prefix/suffix 决定，**必须与 preflight 注入的变量名一致**。
  - `options`：`prefix?`、`suffix?`（默认与 preset 对齐）、`semantic?`（是否加语义别名，默认 false）、`boxShadow?`。
- `presetPrism(input: PrismInput | PrismTheme, options?: PresetPrismOptions): Preset`
  - 若传入 `PrismInput` 则内部 `generateTheme(input)`；若已是 `PrismTheme` 直接用（用 `meta.generator === 'prism'` 或结构判定区分）。
  - 返回 UnoCSS `Preset`：
    - `name: '@simple-prism/unocss'`
    - `preflights: [{ getCSS: () => toCssVariables(theme, { format:'rgb-channels', prefix, suffix, darkSelector, semantic }) }]`
    - `theme: { colors: toUnoTheme(theme, {...}).colors, boxShadow? }`
    - 暗色：`darkSelector` 默认 `.dark`，与 presetWind3 `dark:'class'` 一致。
  - `options`：`prefix?`、`suffix?`、`darkSelector?`、`semantic?`、`boxShadow?`，以及 generateTheme 相关透传（当传入 `PrismInput` 时）。
- 依赖：
  - `dependencies`: `@simple-prism/core`、`@simple-prism/css`（workspace）。
  - `peerDependencies`: `unocss`（仅类型 `Preset`；用 `import type` 避免硬运行时依赖）。
  - workspace：加入 `pnpm-workspace.yaml`（若用 glob `packages/*` 则自动纳入）。

**用户侧最终形态**：

```ts
import presetUno from "@unocss/preset-uno";
import { presetPrism } from "@simple-prism/unocss";

export default defineConfig({
  presets: [presetUno(), presetPrism({ primary: "#3b82f6" })],
});
// 变量注入 + colors + dark 全自动；bg-primary / bg-primary-600 / bg-primary/10 直接可用
```

**测试** `packages/unocss/test/unocss.test.ts`：

- `toUnoTheme` 键含 `primary`/`primary-500`…；值含 `rgb(var(` 与 `<alpha-value>`。
- `presetPrism(input)` 返回对象含 `name`、`preflights`、`theme.colors`。
- preflight `getCSS()` 输出含 `:root`、`.dark` 与裸通道（`--…: 59 130 246`）。
- preflight 注入的变量名与 `theme.colors` 里 `var(--…)` 引用一致（同名校验）。
- `presetPrism(theme)`（已建好的 theme）与 `presetPrism(input)` 结果一致。

### D. 文档同步

- `README.md`（根）：适配器表新增 `@simple-prism/unocss` 行（入口 `toUnoTheme`、`presetPrism`）；css 行补 `rgb-channels`/`suffix` 说明。
- `docs/api/unocss.md`：新建，讲 `toUnoTheme` / `presetPrism` 用法、与 presetWind3 的关系、`<alpha-value>` 机制、裸通道要求。
- `docs/api/css.md`：更新，加 `rgb-channels` 格式与 `prefix`（可空）/`suffix` 选项，给出 gva 形状示例。
- `docs/.vitepress/config.ts`：侧栏 API 分组加 UnoCSS 条目。
- `docs/compare/gin-vue-admin.md`：更新为「现已可零 shim 接入（presetPrism / css rgb-channels）」。

### E. Playground 同步

- `playground/src/components/ExportView.vue`：
  - `Tab` 加 `"unocss"`；`TABS` 加 `{ id:'unocss', label:'UnoCSS' }`；`FILENAMES` 加 `uno.config.ts`（或展示片段）。
  - `outputs` 加 `unocss`：展示可直接粘贴的 `uno.config` 片段（`presetPrism` 用法）+ 注入的变量预览。
  - `FORMATS` 数组加 `"rgb-channels"`，让 CSS/Tailwind/SCSS 预览可切裸通道。

## 完成判据

- 新包纳入 workspace，`pnpm install` 通过。
- `pnpm build`（tsdown 全包，含新 unocss 包）通过。
- `pnpm test`（vitest）全绿，含新增用例。
- `pnpm typecheck` 全绿。
- `pnpm lint` + `pnpm format:check` 通过。
- 文档与 playground 均已更新。
- 版本号/发布留给维护者。

## 风险与缓解

- **裸通道依赖 alpha 包壳**：`rgb-channels` 变量单独不是合法颜色，只有在 `rgb(var() / α)` 内才成立。缓解：仅在 css/unocss 的 `rgb(var())` 语境使用；文档明确说明。
- **`toSrgb255` 返回浮点**：拼通道时若不取整会出 `34.2 100.7 …`。缓解：`formatRgbChannels` 内 `Math.round`，测试断言整数。
- **各适配器 switch 落 default**：新增 format 若未在 css/scss/tailwind 的 switch 显式处理会静默落 oklch。缓解：改为委托 `formatIn` 或显式加 case，并加测试。
- **peer unocss 版本**：只用 `Preset` 类型，`import type` + 宽松 peer 范围（`>=0.58` 或 `*`），降低版本耦合。
