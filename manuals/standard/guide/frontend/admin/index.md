# 3.1 admin 后台端

`template/admin` 是面向管理员的单页应用，基于 **Vben Admin 5.7（Element Plus 版）** 内核定制。

## 3.1.1 特点

| 特点 | 说明 |
| --- | --- |
| 声明式 CRUD | 一份 `schema` 配置驱动表格、搜索、表单、权限，页面文件通常不足 20 行 |
| 内核内联 | Vben 内核被内联到 `src/core/`，可读可控，但不建议直接改 |
| 混合路由 | 本地静态路由 + 后端下发的动态菜单，二者可合并 |
| 完整 RBAC | 路由级、菜单级、按钮级三层权限 |
| 类型安全 | 全量 TypeScript，`vue-tsc` 严格校验 |
| 多语言 | `vue-i18n`，语言包位于 `src/locales/` |
| 可插拔 | `src/plugin/` 下的插件自动被路由与页面扫描器发现 |

## 3.1.2 一个页面长什么样

以内置的"岗位管理"为例，只有两个文件。

**`src/views/system/post/index.vue`**

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

**`src/api/system/post/index.ts`**

```ts
import type { PostRow } from './types';

import BaseService from '#/api/core/base';

const baseUrl = '/system/post';

export const PostService = {
  ...BaseService<PostRow>({ baseUrl }),
  getList: BaseService<PostRow>({ baseUrl }).list,
};
```

剩下的表格列、搜索条件、表单字段、按钮权限，全部写在 `schemas/index.tsx` 里，详见 [3.1.8 CRUD 页面开发](crud.md)。

## 3.1.3 本章导航

| 小节 | 内容 |
| --- | --- |
| [3.1.1 快速上手](getting-started.md) | 安装、启动、代理配置、第一个页面 |
| [3.1.2 目录结构](directory.md) | `src/` 各目录职责与代码放置规范 |
| [3.1.3 请求层](request.md) | `requestClient`、拦截器、Token 刷新、错误处理 |
| [3.1.4 路由与菜单](router.md) | 静态路由、后端菜单、路由守卫、组件扫描 |
| [3.1.5 权限控制](access.md) | 权限码、路由/按钮级鉴权 |
| [3.1.6 状态管理](store.md) | `auth`、`dict`、`notify`、`terminal`、`site-config` |
| [3.1.7 UI 适配层](ui-adapter.md) | `adapter/form.ts`、`adapter/vxe-table.ts` 全局默认值 |
| [3.1.8 CRUD 页面开发](crud.md) | **核心**，`CrudSchema` 完整说明 |
| [3.1.9 国际化](i18n.md) | 语言包组织与 `$t` 用法 |
| [3.1.10 前端插件](plugin.md) | `src/plugin/` 插件机制 |
| [3.1.11 环境变量与构建](build.md) | `.env`、Vite 配置、构建模式 |

> 下一节：[3.1.1 快速上手](getting-started.md)
