# 3.2.3 页面与路由

web 端的路由由两部分组成：

1. **Nuxt 文件路由** —— 决定 URL 能访问到哪个组件
2. **`src/pages/routes.ts`** —— 决定菜单如何展示、权限如何校验

## 一、三种路由模式

由 `NUXT_PUBLIC_ROUTING_MODE` 控制：

| 模式 | 行为 | 适用 |
| --- | --- | --- |
| `frontend` | 前端 `routes.ts` 声明式生成菜单骨架，后端仅裁剪可见性 | 页面结构固定、本地联调 |
| `backend` | 后端接口完全下发菜单 | CMS 场景，运营自由配置 |
| `hybrid` | 后端菜单为主骨架 + 前端路由补充合并 | **推荐**，兼顾灵活与可控 |

`nuxt.config.ts` 中的默认值：

```ts
runtimeConfig: {
  public: {
    // 路由菜单模式：frontend / backend / hybrid，默认 frontend
    ROUTING_MODE: process.env.NUXT_PUBLIC_ROUTING_MODE || 'frontend',
  },
},
```

项目 `.env.development` / `.env.production` 中均设为 `hybrid`。

运行时读取：

```ts
const { ROUTING_MODE } = useRuntimeConfig().public;
```

## 二、文件路由

```
src/pages/
├── index.vue                    →  /
├── about/index.vue              →  /about
├── article/
│   ├── index.vue                →  /article
│   └── [id].vue                 →  /article/:id
├── member/
│   ├── index.vue                →  /member
│   └── components/              子组件目录（不产生路由）
│       ├── profile/index.vue
│       ├── settings/index.vue
│       └── ...
└── routes.ts                    菜单声明（非页面）
```

动态参数：

```vue
<!-- pages/article/[id].vue -->
<script setup lang="ts">
const route = useRoute();
const id = route.params.id;

const { data: article } = await useAsyncData(`article-${id}`, () =>
  request.get(`/content/article/${id}`),
);
</script>
```

由于开启了 `typedPages: true`，`navigateTo()` 会有路径类型提示。

## 三、菜单声明 `routes.ts`

`src/pages/routes.ts` 默认导出一个数组，声明菜单结构：

```ts
export default [
  {
    path: '/',
    component: () => import('~/pages/index.vue'),
    meta: {
      title: '首页',
      // menu 默认 true，无需显式声明
      category: '1',
      order: 0,
      icon: 'mdi:home',
    },
  },
  {
    path: '/member/profile',
    component: () => import('~/pages/member/components/profile/index.vue'),
    meta: {
      title: '个人资料',
      layout: 'member',
      category: '2',
      parent: '/member/account',
      parentTitle: '账户设置',
      order: 10,
      icon: 'mdi:account-circle',
      is_public: false,
      is_no_auth: true,
      code: 'member:profile',
    },
  },
  // ...
];
```

### `meta` 字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 菜单标题 |
| `icon` | `string` | 图标（Iconify 名称，如 `mdi:home`） |
| `order` | `number` | 排序，越小越靠前 |
| `category` | `string` | 菜单分类分组（`'1'` 主导航、`'2'` 会员中心…） |
| `layout` | `string` | 使用的布局（如 `member`） |
| `parent` | `string` | 父级菜单路径，用于构建层级 |
| `parentTitle` | `string` | 父级菜单标题 |
| `menu` | `boolean` | 是否在菜单显示，**默认 `true`** |
| `is_public` | `boolean` | 是否公开页面（无需登录） |
| `is_no_auth` | `boolean` | 是否跳过权限校验（仅需登录态） |
| `code` | `string` | 权限码，与后端一致 |

### 层级菜单的写法

通过 `parent` + `parentTitle` **扁平声明**层级，而不是嵌套 `children`：

```ts
{
  path: '/member/profile',
  meta: {
    parent: '/member/account',       // 归属于「账户设置」分组
    parentTitle: '账户设置',
    category: '2',
    order: 10,
  },
}
```

同一 `parent` 下的项会自动聚合为一个菜单组，`order` 决定组内顺序。

> 好处：新增子菜单只要追加一条扁平记录，不用修改父节点结构。

### `is_public` 与 `is_no_auth` 的区别

| 字段 | 含义 |
| --- | --- |
| `is_public: true` | 完全公开，游客可访问 |
| `is_no_auth: true` | 需要登录，但**不校验具体权限码** |
| 两者都为 false | 需要登录 **且** 具备 `code` 对应的权限 |

会员中心的页面通常是 `is_public: false` + `is_no_auth: true`：登录即可访问，不做细粒度权限控制。

## 四、新增页面完整流程

### 1. 建页面

`src/pages/news/index.vue`

```vue
<script setup lang="ts">
import { request } from '~/api/request';

definePageMeta({ layout: 'default' });

useHead({
  title: '新闻资讯',
  meta: [{ name: 'description', content: '最新新闻资讯' }],
});

const { data: list } = await useAsyncData('news-list', () =>
  request.get('/content/article', { params: { page: 1, limit: 10 } }),
);
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10">
    <h1 class="mb-6 text-3xl font-bold">新闻资讯</h1>
    <ul class="space-y-4">
      <li v-for="item in list?.items" :key="item.id">
        <NuxtLink :to="`/news/${item.id}`" class="hover:text-primary">
          {{ item.title }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
```

### 2. 建详情页

`src/pages/news/[id].vue`

```vue
<script setup lang="ts">
import { request } from '~/api/request';

const route = useRoute();

const { data: detail } = await useAsyncData(`news-${route.params.id}`, () =>
  request.get(`/content/article/${route.params.id}`),
);

useHead({
  title: () => detail.value?.title ?? '详情',
  meta: [{ name: 'description', content: () => detail.value?.summary ?? '' }],
});
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="text-2xl font-bold">{{ detail?.title }}</h1>
    <div class="prose mt-6" v-html="detail?.content" />
  </article>
</template>
```

### 3. 声明菜单

`src/pages/routes.ts`

```ts
{
  path: '/news',
  component: () => import('~/pages/news/index.vue'),
  meta: {
    title: '新闻资讯',
    category: '1',
    order: 20,
    icon: 'mdi:newspaper',
  },
},
```

详情页通常不进菜单，可不声明，或声明时加 `menu: false`。

## 五、路由中间件

### 全局中间件

文件名加 `.global` 后缀：

```ts
// src/middleware/tenant.global.ts
export default defineNuxtRouteMiddleware(() => {
  // 每次路由切换都执行
});
```

### 页面级中间件

```ts
// src/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token');
  if (!token.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
```

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
</script>
```

## 六、布局

```vue
<script setup lang="ts">
definePageMeta({ layout: 'member' });   // 使用 layouts/member.vue
</script>
```

也可以在 `routes.ts` 的 `meta.layout` 中声明。

## 七、预渲染

`nuxt.config.ts`：

```ts
nitro: {
  prerender: {
    crawlLinks: false,
    routes: ['/'],
    ignore: ['/hi'],
  },
},
```

- `routes` — 需要预渲染的路径
- `crawlLinks: false` — 不自动爬取页面内链接
- `ignore` — 排除的路径

需要更多页面静态化时，把路径加进 `routes`。详见 [3.2.5 渲染与 SEO](seo.md)。

## 八、常见问题

| 现象 | 处理 |
| --- | --- |
| 页面能访问但菜单不显示 | `routes.ts` 中未声明，或 `menu: false` |
| 菜单顺序不对 | 调整 `meta.order` |
| 菜单没有分组 | 检查 `parent` / `parentTitle` / `category` |
| 未登录也能进会员页 | 未配置 `middleware: 'auth'` 或 `is_public` 设置有误 |
| `backend` 模式下页面 404 | 后端菜单的组件路径与前端文件路由不匹配 |
| 动态路由参数取不到 | 文件名需为 `[id].vue`，通过 `route.params.id` 取 |

> 下一节：[3.2.4 请求与状态](request.md)
