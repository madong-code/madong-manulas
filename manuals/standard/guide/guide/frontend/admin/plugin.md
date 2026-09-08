# 3.1.10 前端插件

`src/plugin/` 下的每个目录都是一个**自包含的功能模块**：自带路由、页面、接口、语言包。放进去即生效，删除即卸载，核心代码零改动。

## 一、内置插件

| 插件 | 目录 | 说明 |
| --- | --- | --- |
| `codegen` | `src/plugin/codegen/` | 代码生成器（生成代码 + 数据表维护） |
| `demo` | `src/plugin/demo/` | 组件演示（表单、表格、CRUD、Widgets 等） |

## 二、插件目录结构

以 `codegen` 为例：

```
src/plugin/codegen/
├── routes/
│   └── index.ts                    路由定义（必须 export default）
├── api/
│   └── generate-column/
│       ├── index.ts
│       └── types.ts
├── views/
│   ├── generate/
│   │   ├── index.vue
│   │   ├── generator.vue
│   │   ├── components/
│   │   └── schemas/index.tsx
│   └── table/
│       ├── index.vue
│       └── components/
└── lang/
    ├── zh-CN/
    │   ├── generate.json
    │   └── table.json
    └── en-US/
```

约定目录：

| 目录 | 作用 | 是否必需 |
| --- | --- | --- |
| `routes/index.ts` | 路由定义 | 需要页面时必需 |
| `views/` | 页面组件 | 需要页面时必需 |
| `api/` | 接口定义 | 可选 |
| `lang/` | 语言包 | 可选 |
| `components/` | 插件内部组件 | 可选 |

## 三、路由定义

`routes/index.ts` 中 `component` 写**字符串路径**，相对于该插件的 `views/` 目录：

```ts
import type { RouteRecordStringComponent } from '#/core/shared/types';

import { $t } from '#/locales';

/** 插件路由定义类型：component 可选，无 component 但有 children 时自动渲染为 RouterView 容器 */
type PluginRoute = Omit<RouteRecordStringComponent, 'children' | 'component'> & {
  children?: PluginRoute[];
  component?: string;
};

const routes: PluginRoute[] = [
  {
    path: '/codegen',
    name: 'Codegen',
    meta: {
      title: $t('codegen.generate.menu'),
      icon: 'lucide:code-2',
      order: 100,
      constant: false,
    },
    children: [
      {
        path: '/codegen',
        name: 'CodegenGenerate',
        component: 'generate/index',            // → views/generate/index.vue
        meta: {
          title: $t('codegen.generate.menu_generate'),
          icon: 'lucide:table',
        },
      },
      {
        path: '/codegen/generator',
        name: 'CodegenGenerator',
        component: 'generate/generator',
        meta: {
          title: $t('codegen.generate.menu_generator'),
          icon: 'lucide:file-code-2',
          hideInMenu: true,                     // 详情页不进菜单
        },
      },
      {
        path: '/codegen/table',
        name: 'CodegenTable',
        component: 'table/index',
        meta: {
          title: $t('codegen.table.menu_table'),
          icon: 'lucide:database',
        },
      },
    ],
  },
];

export default routes;
```

要点：

- **必须 `export default`**
- 父级不写 `component`、只有 `children` 时，自动渲染为 `RouterView` 容器
- `component` 不带 `.vue` 后缀
- `meta.order` 控制菜单排序

## 四、插件如何被加载

### 组件扫描

`router/access.ts` 把 `views/` 与 `plugin/` 下所有 `.vue` 一起收进 `pageMap`：

```ts
const viewsMap = import.meta.glob('../views/**/*.vue', { eager: false });
const pluginsMap = import.meta.glob('../plugin/**/*.vue', { eager: false });

const pageMap: ComponentRecordType = {
  ...(viewsMap as ComponentRecordType),
  ...(pluginsMap as ComponentRecordType),
};
```

### 路由扫描与合并

`router/plugin/scanner.ts` 负责扫描插件路由：

```ts
export class PluginRouteScanner {
  private cachedBackendRoutes: any[] = [];
  private cachedFrontendRoutes: RouteRecordRaw[] = [];
  private hasScanned: boolean = false;
  private readonly isDev: boolean = import.meta.env.DEV;
  // 全局页面映射表，用于校验组件路径是否存在
  private pageMap: null | Record<string, () => Promise<any>> = null;

  constructor() {
    // 预加载页面映射表，用于路径校验
    if (this.isDev) {
      this.pageMap = import.meta.glob('../../plugin/**/*.vue', { eager: false });
    }
  }
  // ...
}
```

特性：

- **缓存** — 只扫描一次，结果缓存
- **开发期路径校验** — dev 模式下校验 `component` 指向的文件是否存在
- **错误隔离** — 单个插件出错不影响其他插件

### 合并进后端菜单

```ts
async function fetchBackendMenus(): Promise<any[]> {
  const backendMenus = await getAllMenusApi();
  // ...去重...
  return pluginRouter.mergeBackendMenus(dedup(backendMenus));
}
```

合并策略（见 `scanner.ts` 的 `mergeBackendMenus`）：

```ts
// 先去重，相同 name 的只保留第一个（后端优先，插件路由后续覆盖）
const uniqueRoutes = [...new Map(routes.map((r) => [r.name, r])).values()];

return uniqueRoutes.map((route) => {
  const pluginRoute = pluginRouteMap.get(route.name);
  if (pluginRoute) {
    // 合并路由，插件路由优先
    const mergedRoute = { ...route, ...pluginRoute };
    // 递归合并子路由
    if (route.children && pluginRoute.children) {
      mergedRoute.children = mergeRouteTree([...route.children, ...pluginRoute.children]);
    }
    return mergedRoute;
  }
  return route;
});
```

> **同名路由以插件定义为准**，因此插件可覆盖后端菜单的配置。

### 语言包扫描

`locales/loader/` 自动扫描 `plugin/*/lang/`，key 格式为 `插件名.文件名.层级key`：

```ts
$t('codegen.generate.menu')   // plugin/codegen/lang/zh-CN/generate.json → menu
```

## 五、`pluginRouter` API

```ts
import pluginRouter from '#/router/plugin';

// 获取纯前端格式路由
pluginRouter.getFrontendRoutes(forceRescan?: boolean): RouteRecordRaw[]

// 合并插件路由到后端菜单
pluginRouter.mergeBackendMenus(backendMenus: any[], forceRescan?: boolean): any[]

// 一次性扫描前后端两种格式
pluginRouter.scanAll(): { backend: any[]; frontend: RouteRecordRaw[] }

// 扫描状态（调试用）
pluginRouter.getStatus(): { hasScanned, frontendCount, backendCount }

// 清除缓存
pluginRouter.clearAllCache(): void
```

## 六、开发一个插件

以「公告管理」插件为例。

### 1. 创建目录

```
src/plugin/notice/
├── routes/index.ts
├── api/index.ts
├── views/
│   ├── index.vue
│   └── schemas/index.tsx
└── lang/
    ├── zh-CN/notice.json
    └── en-US/notice.json
```

### 2. 语言包

`lang/zh-CN/notice.json`

```json
{
  "menu": "公告管理",
  "title": "公告",
  "name": "公告标题",
  "content": "公告内容"
}
```

对应 key 前缀为 `notice.notice.*`（插件名 + 文件名）。

### 3. 接口

`api/index.ts`

```ts
import BaseService from '#/api/core/base';

export interface NoticeRow {
  id: number | string;
  title: string;
  content: string;
  enabled: number;
}

export const NoticeService = BaseService<NoticeRow>({
  baseUrl: '/content/notice',
});
```

### 4. Schema

`views/schemas/index.tsx`

```tsx
import type { CrudSchema } from '#/adapter/crud';

import { DictEnum } from '#/enums';
import { $t } from '#/locales';

import { NoticeService } from '../../api';

export const useCrudSchema = (): CrudSchema => ({
  crudApi: {
    list: NoticeService.list,
    add: NoticeService.create,
    edit: NoticeService.update,
    remove: NoticeService.delete,
    batchRemove: NoticeService.remove,
    view: NoticeService.get,
  },

  hasAdd: true,
  hasEdit: true,
  hasRemove: true,

  permissions: {
    add: 'content:notice:create',
    edit: 'content:notice:update',
    remove: 'content:notice:delete',
  },

  columns: [
    { type: 'checkbox', width: 60 },
    { field: 'title', title: $t('notice.notice.name'), minWidth: 200, align: 'left' },
    {
      field: 'enabled',
      title: '状态',
      minWidth: 90,
      cellRender: { name: 'CellDictTag', attrs: { code: DictEnum.SYS_ENABLED_STATUS } },
    },
  ],

  searchForm: {
    enabled: true,
    schema: [
      {
        component: 'Input',
        fieldName: 'LIKE_title',
        label: $t('notice.notice.name'),
        componentProps: { clearable: true },
      },
    ],
  },

  formDialog: {
    enabled: true,
    title: $t('notice.notice.title'),
    width: 'w-[50%]',
    wrapperClass: 'grid-cols-1',
    schema: [
      {
        label: 'ID',
        fieldName: 'id',
        component: 'Input',
        dependencies: { triggerFields: ['id'], show: false },
      },
      {
        label: $t('notice.notice.name'),
        fieldName: 'title',
        component: 'Input',
        rules: 'required',
      },
      {
        label: $t('notice.notice.content'),
        fieldName: 'content',
        component: 'Textarea',
      },
    ],
  },
});
```

### 5. 页面

`views/index.vue`

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

### 6. 路由

`routes/index.ts`

```ts
import { $t } from '#/locales';

const routes = [
  {
    path: '/notice',
    name: 'Notice',
    meta: {
      title: $t('notice.notice.menu'),
      icon: 'lucide:megaphone',
      order: 300,
    },
    children: [
      {
        path: '/notice/list',
        name: 'NoticeList',
        component: 'index',      // → views/index.vue
        meta: { title: $t('notice.notice.title') },
      },
    ],
  },
];

export default routes;
```

### 7. 重启 dev server

插件路由与语言包在构建期通过 glob 收集，**新增插件目录后需要重启开发服务**。

## 七、与后端插件配合

前端插件通常与后端插件（`backend/plugin/<name>/`）成对出现：

| 层 | 位置 | 内容 |
| --- | --- | --- |
| 前端 | `template/admin/src/plugin/<name>/` | 页面、路由、接口定义、语言包 |
| 后端 | `backend/plugin/<name>/` | 控制器、服务、模型、路由、菜单 SQL |

> **重要**：后端运行时只扫描 `backend/plugin/`。插件市场模板目录仅作安装源使用，运行时不会被读取，详见 [4.3.2 应用插件](../../backend/advanced/plugin.md)。

## 八、注意事项

1. **路由 `name` 必须全局唯一** —— 与后端菜单、其他插件冲突时会被合并覆盖。
2. **`component` 路径相对插件 `views/`** —— 不是相对 `src/views/`。
3. **必须 `export default`** —— 否则扫描器取不到路由。
4. **新增插件要重启 dev server** —— glob 在构建期解析。
5. **语言包 key 带插件名前缀** —— 避免与框架文案冲突。
6. **插件应自包含** —— 尽量不依赖其他插件，便于独立装卸。
7. **权限码仍需后端配合** —— 前端 `permissions` 只控显隐，实际鉴权在后端。

> 下一节：[3.1.11 环境变量与构建](build.md)
