# Element Plus · 主题定制

Element Plus 主题与项目整体主题体系（[`common/theme.md`](../../common/theme.md)）共用一套 **CSS 变量**，通过 `preferences` 用户偏好切换。

---

## 1. 变量层级

```text
:root (基础变量)
  ├── 通用语义变量 (--vben-color-*, --vben-border-*)
  └── Element Plus 变量 (--el-color-primary, --el-border-radius-base, ...)
```

切换暗黑模式时，`src/core` 在 `<html>` 上加 `.dark` class，两套变量同时翻转到暗色值。

---

## 2. 修改主色

方式一：使用偏好面板（运行时）

- 点击顶栏主题图标 → 调色板 → 修改 `colorPrimary`，自动写入 `localStorage` 并即时生效（含 Element Plus 主色重算）。

方式二：静态覆盖（构建期）

在 `src/styles/` 下新增：

```css
:root {
  --el-color-primary: #3b82f6;
  --el-color-primary-light-3: #60a5fa;
  --el-color-primary-light-5: #93c5fd;
  --el-color-primary-light-7: #bfdbfe;
  --el-color-primary-light-8: #dbeafe;
  --el-color-primary-light-9: #eff6ff;
  --el-color-primary-dark-2: #2563eb;
  --el-border-radius-base: 6px;
}
```

> Element Plus 主色的 2/3/5/7/8/9 阶梯变量需手动生成，建议使用其官方主题生成器得到完整阶梯值。

---

## 3. 暗黑模式

```ts
import { preferencesManager } from '#/core/preferences';
preferencesManager.setPreferences({
  theme: { mode: 'dark' },   // 'light' | 'dark' | 'auto'
});
```

`auto` 模式跟随系统 `prefers-color-scheme`。Element Plus 的暗色由 `.dark` 下 `--el-color-*` 变量驱动，无需引入独立 dark CSS（项目已封装）。

---

## 4. 组件尺寸与圆角

```css
:root {
  --el-component-size: 32px;          /* 默认控件高度 */
  --el-border-radius-base: 6px;       /* 圆角 */
  --el-font-size-base: 14px;
}
```

统一在 `src/styles/element-plus-overrides.css`（或等价文件）中集中管理，避免散落。

---

## 5. 字体与中文

Element Plus 默认字体栈已含中文回退；如需替换，在 `:root` 覆盖 `--el-font-family`。

---

## 6. 多 UI 主题一致性

切换至 `admin-antd` / `admin-naive` 时，主题变量体系保持一致（通用语义变量不变），仅 `--el-*` 变为对应 UI 库的变量前缀（如 `--ant-*`）。业务页面不感知具体变量，因此主题切换对多套 UI 透明。
