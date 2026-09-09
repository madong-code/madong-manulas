# Mono 基础组件

本文介绍 mono 下 admin / platform 两个应用**共用的一套业务组件**。两应用的 `src/components/` 结构一致，核心是 CRUD 组件与表单组件，均基于 VxeTable + Element Plus 封装。

## 组件位置

admin / platform 各自维护一份（双份同源），路径一致：

```
apps/{admin,platform}/src/components/
├── crud/                    # CRUD 组件（核心）
│   ├── crud.vue             # 核心 CRUD 组件
│   ├── use-crud.ts          # useCrud composable
│   ├── types.ts             # 类型定义
│   └── components/          # 子组件（dialog / table-action / viewer）
├── form/                    # 表单组件
├── dialog/                  # 弹窗封装
├── page/                    # 页面容器
├── render/                  # 渲染组件（TSX）
└── icon/                    # 图标
```

## 统一适配器导出

业务代码统一从 `#/adapter/*` 导入，适配器再 re-export 到 `#/components/*`：

```typescript
// apps/{admin,platform}/src/adapter/crud/index.ts
export { default as Crud } from '#/components/crud/crud.vue';
export { useCrud } from '#/components/crud/use-crud';
```

## 核心组件

| 组件 | 说明 | 文档 |
| --- | --- | --- |
| CRUD | 表格 + 搜索 + 表单弹窗一体化 | [CRUD 组件](./crud/overview.md) |
| 表单 | Schema 驱动表单 | [表单组件](./form.md) |

## 各应用特有组件

| 应用 | 特有组件 |
| --- | --- |
| admin | `tenant-switch/`（租户切换）等 |
| platform | `notification-drawer/`（消息通知抽屉）等 |

## 下一步

- [CRUD 组件详解](./crud/overview.md)
- [表单组件详解](./form.md)
