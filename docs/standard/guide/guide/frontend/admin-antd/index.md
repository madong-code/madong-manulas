# 后台管理 · Ant Design Vue 分册（预留骨架）

> **状态：预留骨架（skeleton）。** 本套 UI（Ant Design Vue，`admin-antd`）尚未落地，目录结构与 [`admin-ele/index.md`](../admin-ele/index.md) 完全一致，便于后续切换 UI 时直接填充。
> 通用能力请阅读 [`../common/index.md`](../common/index.md)；如何把本套从骨架变为完整实现见 [`../common/add-new-ui.md`](../common/add-new-ui.md)（Step 1-11）。

---

## 1. 这套 UI 的定位

- **UI 框架**：Ant Design Vue（ant-design-vue）。
- **工程位置（规划）**：`template/admin-antd/` 或 `template/admin` 切换 `.env` + 依赖（由 `add-new-ui` 决定）。
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

- `adapter/component/index.ts` 改为注册 `a-input` / `a-select` 等 AntD 组件，`ComponentType` 类型变更。
- `adapter/form.ts` 的 `modelPropNameMap` 调整（如 `a-upload` 用 `file-list`）。
- `ComponentPropsMap` 替换为 `ant-design-vue` 的 props 类型。
- 主题变量由 `--el-*` 改为 `--ant-*`，但通用语义变量（`--vben-*`）不变，业务页面无感。

> 业务页面（`views/**`）、`api/**`、`CrudSchema` 等**完全复用**，无需重写 — 这正是 `adapter/` 抽象的目的。

---

## 4. 填充进度

- [ ] 注册 AntD 组件到 `adapter/component`
- [ ] 配置 `adapter/form.ts` 校验与 model 映射
- [ ] 补充 `theme.md` 的 `--ant-*` 变量
- [ ] 校验 `ApiDict` / `Upload` 等组件在 AntD 下的行为
- [ ] 各章节从骨架转为完整示例
