# 开发规范 · 前端

---

## 1. 工程约定

- 语言：TypeScript（严格模式），`<script setup lang="ts">`。
- 包管理：`pnpm`（模板含 `preinstall` 强制 only-allow pnpm）。
- 路径别名：`#/` 指向 `src/`（如 `#/api`、`#/adapter`、`#/components`）。

---

## 2. 目录纪律

- 业务页面：`src/views/<module>/<entity>/{index.vue, schemas/index.tsx, components/*}`。
- 接口：`src/api/<module>/<entity>/{index.ts, types.ts}`，继承 `BaseService`。
- 适配层：`src/adapter/`（多 UI 切换点），业务**不**在此写具体 UI 逻辑。
- 通用能力（请求/路由/权限/store/i18n/主题）放 `src/core`，业务不覆盖内核。

---

## 3. 组件与表单

- 新增表单组件放 `src/components/form/components/<kebab>/index.vue`，自动被 component-map 扫描（无需手 import）。
- 组件名 `PascalCase`，目录 `kebab-case`。
- Schema 用 `component: 'Input'`（字符串）引用已注册组件。

---

## 4. CRUD 模式

- 列表/表单用 `useCrud` + `CrudSchema`，不手搓表格。见 [`frontend/admin-ele/index.md`](../frontend/admin-ele/index.md)。

---

## 5. 类型与命名

- 变量/方法 `camelCase`；类型/接口 `PascalCase`。
- API 返回类型在 `types.ts` 定义。
- i18n key 用点分路径（如 `system.role.title`），文案放 `lang/`。

---

## 6. 多 UI 适配

- 切换 UI 只改 `adapter/`、`components/form/components/`、`vite.config.ts`、`package.json`、`.env`。**业务 `views`/`api` 不变**。
- 新增 UI 走 [`frontend/common/add-new-ui.md`](../frontend/common/add-new-ui.md) 的 11 步。

---

## 7. 注释

- 复杂逻辑写行内注释；组件/函数写简要 JSDoc。
- 不写显而易见注释。
