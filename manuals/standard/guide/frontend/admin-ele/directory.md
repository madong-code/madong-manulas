# Element Plus · 目录结构

本文聚焦 `template/admin/` 下与 **Element Plus 适配直接相关** 的目录。全局工程结构见 [`common/project-structure.md`](../../common/project-structure.md)。

---

## 1. 适配层目录（Element Plus 专属）

```text
template/admin/src/
├── adapter/                      # UI 适配层（多套 UI 切换点）
│   ├── component/
│   │   └── index.ts              # ★ EP 组件注册：ComponentType / ComponentPropsMap / initComponentAdapter
│   ├── crud/
│   │   └── index.ts              # 重导出 Crud / useCrud / CrudSchema 类型
│   ├── form.ts                   # ★ EP 表单适配：setupVbenForm、校验规则、modelPropNameMap
│   └── vxe-table.ts              # VxeTable 适配（表格渲染器 CellDictTag 等）
├── components/
│   ├── form/
│   │   └── components/
│   │       ├── index.ts          # ★ component-map 自动扫描入口（kebab→Pascal）
│   │       ├── api-select/       # 远程下拉（ApiSelect 等）
│   │       ├── api-dict/         # 字典下拉（ApiDict）
│   │       ├── upload/           # 上传（映射 Upload → fileList）
│   │       └── ...               # 29+ 业务表单组件
│   ├── crud/                     # BasicCrud 组件（VxeTable 封装）
│   ├── page/                     # Page 布局容器
│   ├── dialog/                   # 通用弹窗
│   └── render/                   # 单元格渲染器（CellDictTag 等）
└── enums/                        # DictEnum 等字典枚举（与后端字典 code 对应）
```

---

## 2. 业务页面目录

```text
src/views/
├── _core/                        # 框架内置页（登录、404、错误页等）
├── system/                       # 系统模块（用户/角色/菜单/字典/部门...）
│   └── role/
│       ├── index.vue             # 页面入口（useCrud 渲染）
│       ├── schemas/index.tsx     # CRUD Schema 定义
│       └── components/           # 该页专属子组件（如授权弹窗）
├── member/                       # 会员模块
├── content/                      # 内容模块
├── ops/                          # 运维模块
├── app/                          # 应用/租户模块
└── dashboard/                    # 仪表盘
```

> 每个业务实体推荐目录：`views/<module>/<entity>/{index.vue, schemas/index.tsx, components/*}`，与 `api/<module>/<entity>/` 一一对应。

---

## 3. 关键文件职责

| 文件 | 职责 |
| ---- | ---- |
| `adapter/component/index.ts` | 声明 `ComponentType` 联合类型与 `ComponentPropsMap`，在 `initComponentAdapter()` 中把 EP 组件 + `component-map` 自动扫描的组件注册进 `globalShareState` |
| `adapter/form.ts` | 调用 `setupVbenForm<ComponentType>()`，配置 `modelPropNameMap`（Upload→fileList、CheckboxGroup→model-value）、`defineRules`（required / selectRequired） |
| `components/form/components/index.ts` | 用 `import.meta.glob` 扫描 `components/form/components/*/index.{vue,tsx}` 并注册到 component-map |
| `adapter/vxe-table.ts` | 注册 VxeTable 单元格渲染器（如 `CellDictTag`），供 Schema 的 `cellRender.name` 引用 |

---

## 4. 与多 UI 的关系

- **切换 UI 时改动点**：`adapter/component/index.ts`、`adapter/form.ts`、依赖（`package.json` 的 `element-plus` ↔ `ant-design-vue`）、`vite.config.ts` 插件、`#/core/ui/common` 的抽象实现。
- **不随 UI 变化**：`views/**`、`api/**`、`components/crud/**`、`adapter/crud/**`、路由、权限、store、i18n。

详见 [`common/add-new-ui.md`](../../common/add-new-ui.md)。
