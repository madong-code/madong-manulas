# 3.1.1 快速上手

## 一、启动

```bash
cd template/admin
pnpm install
pnpm dev
```

访问 **http://localhost:5777**。

前置条件：后端已运行在 `http://127.0.0.1:8500`（见 [2.2 后端安装](../../install/backend.md)）。

## 二、确认代理

`vite.config.ts` 中已配置开发代理：

```ts
server: {
  proxy: {
    '/adminapi': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/adminapi/, ''),
      target: 'http://127.0.0.1:8500/adminapi',
      ws: true,
    },
    '/upload': {
      changeOrigin: true,
      target: 'http://127.0.0.1:8500',
    },
  },
},
```

前端请求 `/adminapi/system/post` → 代理转发到 `http://127.0.0.1:8500/adminapi/system/post`。

若后端端口不同，改 `target` 即可。

## 三、新增一个页面的完整流程

假设要做一个"商品管理"页面，后端接口为 `/shop/goods`。

### 第 1 步：定义类型

`src/api/shop/goods/types.ts`

```ts
export interface GoodsRow {
  id: number | string;
  title: string;
  price: number;
  stock: number;
  enabled: number;
  created_at: string;
}
```

### 第 2 步：定义接口

`src/api/shop/goods/index.ts`

```ts
import type { GoodsRow } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/shop/goods';

export const GoodsService = {
  ...BaseService<GoodsRow>({ baseUrl }),
};
```

`BaseService` 已自动提供 `list / get / create / update / delete / remove / export / changStatus`，无需逐个手写，详见 [3.1.3 请求层](request.md)。

### 第 3 步：编写 Schema

`src/views/shop/goods/schemas/index.tsx`

```tsx
import type { CrudSchema } from '#/components/crud/components/types';

import { GoodsService } from '#/api/shop/goods';
import { DictEnum } from '#/enums';
import { $t } from '#/locales';

export const useCrudSchema = (): CrudSchema => {
  return {
    crudApi: {
      list: GoodsService.list,
      add: GoodsService.create,
      edit: GoodsService.update,
      remove: GoodsService.delete,
      batchRemove: GoodsService.remove,
      view: GoodsService.get,
    },

    hasAdd: true,
    hasEdit: true,
    hasView: true,
    hasRemove: true,

    permissions: {
      add: 'shop:goods:create',
      edit: 'shop:goods:update',
      remove: 'shop:goods:delete',
      view: 'shop:goods:read',
    },

    columns: [
      { type: 'checkbox', width: 60 },
      { field: 'title', title: '商品名称', minWidth: 160, align: 'left' },
      { field: 'price', title: '价格', minWidth: 100 },
      { field: 'stock', title: '库存', minWidth: 100 },
      {
        field: 'enabled',
        title: '状态',
        minWidth: 80,
        cellRender: {
          name: 'CellDictTag',
          attrs: { code: DictEnum.SYS_ENABLED_STATUS },
        },
      },
    ],

    searchForm: {
      enabled: true,
      collapsed: true,
      collapsedRows: 2,
      schema: [
        {
          component: 'Input',
          fieldName: 'LIKE_title',
          label: '商品名称',
          componentProps: { clearable: true, placeholder: '请输入商品名称' },
        },
        {
          component: 'ApiDict',
          fieldName: 'EQ_enabled',
          label: '状态',
          componentProps: {
            clearable: true,
            code: DictEnum.SYS_ENABLED_STATUS,
          },
        },
      ],
    },

    formDialog: {
      enabled: true,
      title: '商品',
      width: 'w-[50%]',
      wrapperClass: 'grid-cols-1',
      commonConfig: { labelWidth: 100, labelAlign: 'right' },
      schema: [
        {
          label: 'ID',
          fieldName: 'id',
          component: 'Input',
          dependencies: { triggerFields: ['id'], show: false },
        },
        {
          label: '商品名称',
          fieldName: 'title',
          component: 'Input',
          rules: 'required',
        },
        {
          label: '价格',
          fieldName: 'price',
          component: 'InputNumber',
          rules: 'required',
          componentProps: { min: 0, precision: 2 },
        },
        {
          label: '库存',
          fieldName: 'stock',
          component: 'InputNumber',
          defaultValue: 0,
          componentProps: { min: 0 },
        },
        {
          label: '状态',
          fieldName: 'enabled',
          component: 'ApiDict',
          defaultValue: 1,
          componentProps: {
            code: DictEnum.SYS_ENABLED_STATUS,
            isBtn: true,
            renderType: 'RadioGroup',
          },
        },
      ],
    },
  };
};
```

> 搜索字段名的 `LIKE_` / `EQ_` 前缀会被后端 `madong/query` 自动识别为查询操作符，无需后端写额外代码。

### 第 4 步：编写页面

`src/views/shop/goods/index.vue`

```vue
<script setup lang="ts">
import { useCrud } from '#/adapter/crud';
import { Page } from '#/components/page';

import { useCrudSchema } from './schemas';

const [BasicCrud] = useCrud(useCrudSchema());
</script>

<template>
  <Page auto-content-height>
    <BasicCrud />
  </Page>
</template>
```

### 第 5 步：让它出现在菜单里

两种方式，二选一：

**方式 A：后端菜单（推荐，生产常用）**

在后台"系统管理 → 菜单管理"中新增菜单，组件路径填 `/shop/goods/index`，并配置权限码 `shop:goods:*`。前端无需改动，登录后自动出现。

**方式 B：本地静态路由（开发调试快）**

在 `src/router/routes/modules/` 下新建或编辑模块文件：

```ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/shop',
    name: 'Shop',
    meta: { icon: 'lucide:shopping-cart', title: '商城管理', order: 200 },
    children: [
      {
        path: 'goods',
        name: 'ShopGoods',
        component: () => import('#/views/shop/goods/index.vue'),
        meta: { title: '商品管理' },
      },
    ],
  },
];

export default routes;
```

`src/router/routes/index.ts` 会自动 glob 扫描 `./modules/**/*.ts`，无需手动注册。

## 四、开发中的常用命令

```bash
pnpm dev          # 开发
pnpm typecheck    # 类型检查
pnpm lint         # 代码检查
pnpm build        # 生产构建
```

## 五、常见起步问题

| 现象 | 处理 |
| --- | --- |
| 页面空白、控制台报组件找不到 | 后端菜单的组件路径必须与 `src/views/**/*.vue` 的实际路径匹配 |
| 接口 401 | Token 失效，重新登录；或检查 `.env` 的 `VITE_GLOB_API_URL` |
| 接口 404 | 检查 `vite.config.ts` 代理 target 与后端端口 |
| 按钮不显示 | `permissions` 中的权限码未分配给当前角色 |

> 下一节：[3.1.2 目录结构](directory.md)
