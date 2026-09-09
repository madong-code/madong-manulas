# 后台管理 · Naive UI 分册（预留骨架）

> **状态：预留骨架（skeleton）。** 本套 UI（Naive UI，`admin-naive`）尚未落地，目录结构与 [`admin-ele/index.md`](../admin-ele/index.md) 一致。通用能力见 [`../common/index.md`](../common/index.md)；落地方法见 [`../common/add-new-ui.md`](../common/add-new-ui.md)。

---

## 1. 这套 UI 的定位

- **UI 框架**：Naive UI（naive-ui）。
- **工程位置（规划）**：`template/admin` 切换 `.env` + 依赖，或独立 `template/admin-naive/`。
- **状态**：骨架占位，**内容待填充**。

---

## 2. 章节导航（与 admin-ele 对齐）

| 章节 | 文件 | 状态 |
| ---- | ---- | ---- |
| 分册总览 | `index.md` | 部分 |
| 快速上手 | `getting-started.md` | 骨架 |
| 目录结构 | `directory.md` | 骨架 |
| 布局与骨架 | `layout.md` | 骨架 |
| 组件适配 | `components.md` | 骨架 |
| 表格与查询 | `table.md` | 骨架 |
| 表单与弹窗 | `form.md` | 骨架 |
| 主题定制 | `theme.md` | 骨架 |
| 常见问题 | `faq.md` | 骨架 |

---

## 3. 落地时与 admin-ele 的差异点（预期）

- `adapter/component/index.ts` 注册 `n-input` / `n-select` 等 Naive 组件。
- `adapter/form.ts` 的 `modelPropNameMap` 调整（Naive 组件 v-model 字段名）。
- 主题变量由 `--el-*` 改为 Naive 的 `n-*` / CSS-in-JS 变量；通用语义变量（`--vben-*`）不变。
- 业务页面（`views/**`）、`api/**`、`CrudSchema` **完全复用**。

---

## 4. 填充进度

- [ ] 注册 Naive 组件到 `adapter/component`
- [ ] 配置 `adapter/form.ts` 校验与 model 映射
- [ ] 补充 `theme.md` 的 Naive 变量
- [ ] 校验 `ApiDict` / `Upload` 在 Naive 下的行为
- [ ] 各章节从骨架转为完整示例
