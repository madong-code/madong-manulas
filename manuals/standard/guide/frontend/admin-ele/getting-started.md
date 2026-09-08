# Element Plus · 快速上手

本文以「在 `system` 模块下新增一个 `GoodsCategory` 商品分类管理页」为例，走完整最小路径。
> 该示例与后端 [`quickstart/first-feature.md`](../../quickstart/first-feature.md) 的 GoodsCategory 后端一一对应，前后端字段、权限码、接口路径完全一致。

---

## 1. 前置条件

- 已完成 [`quickstart/frontend-setup.md`](../../quickstart/frontend-setup.md) 的依赖安装与启动。
- 确认 `.env` 中：
  - `VITE_PORT=5777`
  - `VITE_GLOB_API_URL=/adminapi`
  - `VITE_ENTERPRISE_*` 无需关心（社区版默认）

---

## 2. 第一步：定义 API Service

`src/api/system/goods-category/index.ts`

```ts
import type { GoodsCategoryRow } from './types';

import BaseService from '#/api/core/base';
import { requestClient } from '#/api/request';

const baseUrl = '/system/goods-category';

export const GoodsCategoryService = {
  ...BaseService<GoodsCategoryRow>({ baseUrl }),
};
```

`src/api/system/goods-category/types.ts`

```ts
export interface GoodsCategoryRow {
  id: string;
  name: string;
  code: string;
  pid: string;
  level: number;
  sort: number;
  enabled: 0 | 1;
  created_at: string;
  updated_at: string;
}
```

> `BaseService` 已内置 `list / create / update / delete / get / remove`，无需手写。

---

## 3. 第二步：编写 CRUD Schema

`src/views/system/goods-category/schemas/index.tsx`

```tsx
import type { CrudSchema } from '#/components/crud/components/types';

import { GoodsCategoryService } from '#/api/system';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => ({
  crudApi: {
    list: GoodsCategoryService.list,
    add: GoodsCategoryService.create,
    edit: GoodsCategoryService.update,
    remove: GoodsCategoryService.delete,
    view: GoodsCategoryService.get,
  },
  hasAdd: true,
  hasEdit: true,
  hasRemove: true,
  permissions: {
    add: 'system:goods_category:create',
    edit: 'system:goods_category:update',
    remove: 'system:goods_category:delete',
  },
  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'name', title: $t('system.goodsCategory.columns.name'), minWidth: 160, align: 'left' },
    { field: 'code', title: $t('system.goodsCategory.columns.code'), minWidth: 120 },
    {
      field: 'enabled',
      title: $t('system.goodsCategory.columns.enabled'),
      minWidth: 90,
      cellRender: { name: 'CellDictTag', attrs: { code: DictEnum.SYS_ENABLED_STATUS } },
    },
    { field: 'sort', title: $t('system.goodsCategory.columns.sort'), minWidth: 80 },
  ],
  searchForm: {
    schema: [
      { fieldName: 'LIKE_name', label: $t('system.goodsCategory.search.name'), component: 'Input' },
      {
        fieldName: 'EQ_enabled',
        label: $t('system.goodsCategory.search.enabled'),
        component: 'ApiDict',
        componentProps: { code: DictEnum.SYS_ENABLED_STATUS, clearable: true },
      },
    ],
  },
  formDialog: {
    schema: [
      { fieldName: 'name', label: $t('system.goodsCategory.form.name'), component: 'Input', rules: 'required' },
      { fieldName: 'code', label: $t('system.goodsCategory.form.code'), component: 'Input', rules: 'required' },
      {
        fieldName: 'enabled',
        label: $t('system.goodsCategory.form.enabled'),
        component: 'ApiDict',
        componentProps: { code: DictEnum.SYS_ENABLED_STATUS, renderType: 'RadioGroup', isBtn: true },
        defaultValue: 1,
      },
    ],
    dialogType: 'modal',
    width: 'w-[40%]',
  },
});
```

---

## 4. 第三步：渲染页面

`src/views/system/goods-category/index.vue`

```vue
<script setup lang="ts">
import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';
import { $t } from '#/locales';

import { useCrudSchema } from './schemas';

const [BasicCrud] = useCrud(useCrudSchema());
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
  </Page>
</template>
```

页面标签 `title` 由路由 `meta.title` 决定，路由在 [`common/router.md`](../../common/router.md) 中自动扫描注册。

---

## 5. 验证清单

- [ ] `pnpm dev` 后浏览器打开 `http://localhost:5777`
- [ ] 菜单中出现「商品分类」（需后端返回该菜单且前端路由文件存在）
- [ ] 列表可分页、可搜索
- [ ] 新增/编辑弹窗正常，字典项（`ApiDict`）正常加载
- [ ] 权限码不匹配时按钮自动隐藏

下一步可深入阅读：[表格与查询](./table.md) · [表单与弹窗](./form.md)。
