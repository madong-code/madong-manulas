# CRUD 组件概述

## 简介

CRUD 组件是 admin / platform 两个应用共用的核心业务组件，基于 VxeTable 和 Element Plus 封装，提供完整的增删改查功能。

## 特性

- 🚀 **开箱即用**：内置表格、搜索表单、表单弹窗，一键生成 CRUD 页面
- 🎨 **灵活配置**：支持扁平化配置，所有表格配置项可直接定义在顶层
- 🔐 **权限集成**：内置权限控制，支持按钮级权限
- 🌐 **国际化**：完美支持多语言
- 📱 **响应式**：自适应不同屏幕尺寸

## 组件位置

```
template/mono/apps/admin/src/components/crud/
├── crud.vue                    # 核心 CRUD 组件
├── types.ts                    # 类型定义
├── use-crud.ts                # useCrud composable
├── use-action.ts               # 操作按钮处理逻辑
├── use-columns.ts             # 列定义处理逻辑
└── components/                # 子组件
    ├── dialog/                # 表单弹窗组件
    ├── table-action/          # 表格操作按钮组件
    └── viewer/               # 表单查看器组件
```

## 适配器导出

通过适配器统一导出，使用时从 `#/adapter/crud` 导入：

```typescript
// template/mono/apps/admin/src/adapter/crud/index.ts
export { default as Crud } from '#/components/crud/crud.vue'
export { useCrud } from '#/components/crud/use-crud'
export type {
  CrudApi,
  CrudApiInstance,
  CrudColumn,
  CrudSchema,
} from '#/components/crud/components/types'
```

## 下一步

- [基本用法](./usage.md) - 快速上手 CRUD 组件
- [CrudSchema 配置详解](./schema.md) - 完整的配置项说明
- [表格列定义](./columns.md) - 如何定义表格列
- [搜索表单配置](./search-form.md) - 配置搜索表单
- [表单弹窗配置](./form-dialog.md) - 配置新增/编辑/查看弹窗
