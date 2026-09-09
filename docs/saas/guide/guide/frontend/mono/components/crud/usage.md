# CRUD 组件基本用法

## 快速上手

### 1. 创建 Schema 配置文件

首先在页面目录下创建 `schemas/index.tsx`（使用 `.tsx` 是为了支持 JSX 语法）：

```typescript
// views/system/menu/schemas/index.tsx
import type { CrudSchema } from '#/components/crud/components/types'
import { z } from '#/adapter/form'
import { MenuService } from '#/api/system/menu'
import { DictEnum } from '#/enums'
import { $t } from '#/locales'

export const useCrudSchema = (): CrudSchema => {
  return {
    // API 接口配置
    crudApi: {
      list: (params) => MenuService.getList(params),
      add: (data) => MenuService.create(data),
      edit: (data) => MenuService.update(data.id, data),
      remove: (id) => MenuService.remove(id),
      batchRemove: (ids) => MenuService.batchRemove(ids),
      view: (id) => MenuService.getDetail(id),
    },

    // 表格配置
    rowKey: 'id',
    hasAdd: true,
    hasEdit: true,
    hasRemove: true,
    hasView: true,

    // 权限配置
    permissions: {
      add: 'system:menu:create',
      edit: 'system:menu:update',
      remove: 'system:menu:delete',
      view: 'system:menu:read',
    },

    // 表格列定义
    columns: [
      { type: 'checkbox', width: 60 },
      {
        field: 'title',
        title: $t('system.menu.list.title'),
        align: 'left',
        minWidth: 200,
      },
      {
        field: 'status',
        title: $t('system.menu.list.status'),
        width: 100,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
    ],

    // 搜索表单配置
    searchForm: {
      enabled: true,
      collapsed: true,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_title',
          label: $t('system.menu.search.title'),
        },
      ],
    },

    // 表单弹窗配置
    formDialog: {
      enabled: true,
      title: $t('system.menu.title'),
      width: 'w-[60%]',
      schema: [
        {
          label: $t('system.menu.form.title'),
          fieldName: 'title',
          component: 'Input',
          rules: 'required',
        },
      ],
    },
  }
}
```

### 2. 在页面中使用

```vue
<!-- views/system/menu/index.vue -->
<script setup lang="ts">
import { useCrud } from '#/adapter/crud'
import { useCrudSchema } from './schemas'

defineOptions({ name: 'SystemMenu' })

// 使用 useCrud composable
const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),

  // 可选：覆盖或添加表格行操作按钮
  tableActions: [],
  dropDownActions: [],

  // 可选：覆盖或添加工具栏按钮
  toolbarActions: [],
  dropDownToolbarActions: [],
})

// 可选：通过 crudApi 操作表格
// crudApi.refreshData()
// crudApi.openAddDialog()
</script>

<template>
  <div>
    <BasicCrud />
  </div>
</template>
```

## 核心概念

### useCrud Composable

`useCrud` 是一个组合式 API 函数，接收一个 `CrudSchema` 配置对象，返回 `[CrudComponent, crudApi]` 元组：

```typescript
const [CrudComponent, crudApi] = useCrud(crudSchema)
```

- **CrudComponent**：Vue 组件，直接在模板中使用
- **crudApi**：CRUD 实例 API，用于编程式操作表格

### CrudSchema 配置

`CrudSchema` 是核心配置对象，采用扁平化配置设计：

```typescript
interface CrudSchema {
  // API 接口（必填）
  crudApi: CrudApi

  // 表格配置（可选）
  rowKey?: string
  hasAdd?: boolean
  hasEdit?: boolean
  hasRemove?: boolean
  hasView?: boolean
  permissions?: TablePermissionConfig
  columns?: CrudColumn[]

  // 搜索表单配置（可选）
  searchForm?: SearchFormConfig

  // 表单弹窗配置（可选）
  formDialog?: FormDialogConfig

  // 数据处理钩子（可选）
  beforeFetch?: (params: any) => any
  afterFetch?: (res: any) => any
}
```

## 完整示例

参考实际代码：`template/mono/apps/admin/src/views/app/plugin/develop/`

```vue
<script setup lang="ts">
import { useCrud } from '#/adapter/crud'
import { useCrudSchema } from './schemas'

const [BasicCrud, crudApi] = useCrud({
  ...useCrudSchema(),

  // 添加自定义下拉操作
  dropDownActions: [
    {
      label: $t('app.plugin.develop.action.package'),
      icon: 'ant-design:download-outlined',
      auth: 'plugin:develop:build',
      onClick: async (_e: Event, row: any) => {
        // 自定义业务逻辑
        await handlePackage(row)
      },
    },
  ],
})
</script>

<template>
  <BasicCrud />
</template>
```

## 下一步

- [CrudSchema 配置详解](./schema.md) - 了解所有配置项
- [表格列定义](./columns.md) - 学习如何定义表格列
- [CrudApiInstance API](./api.md) - 了解编程式操作 API
