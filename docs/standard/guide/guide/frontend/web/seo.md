# 3.2.5 渲染与 SEO

## 一、当前渲染模式

`nuxt.config.ts` 末尾：

```ts
ssr: false,
```

**当前为 SPA 模式**（客户端渲染）。这是出于开发便利与部署简单的考虑，但对 SEO 不友好。

## 二、三种渲染模式对比

| 模式 | 配置 | 首屏 | SEO | 服务端要求 |
| --- | --- | --- | --- | --- |
| SPA（当前） | `ssr: false` | 慢（需下载 JS 后渲染） | 差 | 静态托管即可 |
| SSR | `ssr: true` | 快 | 好 | 需 Node 运行时 |
| SSG | `nuxt generate` | 最快 | 最好 | 静态托管即可 |

### 切换到 SSR

```ts
// nuxt.config.ts
ssr: true,
```

构建与运行：

```bash
pnpm build
pnpm start       # node .output/server/index.mjs
```

切换后需要检查：

1. **所有 `window` / `document` / `localStorage` 的直接访问**，需包裹 `process.client` 或放进 `onMounted`
2. **请求层的 store 分支**（`resolveTenantId` 中已有 `process.client` 判断）
3. **数据获取改用 `useAsyncData` / `useFetch`**，避免服务端客户端各请求一次

### 切换到 SSG

```bash
pnpm generate
```

产物在 `.output/public/`，可直接用 Nginx 托管。适合内容更新不频繁的门户站。

## 三、预渲染配置

即使在 SPA 模式下，也可以对指定路由做预渲染：

```ts
nitro: {
  prerender: {
    crawlLinks: false,
    routes: ['/'],
    ignore: ['/hi'],
  },
},
```

| 配置 | 说明 |
| --- | --- |
| `routes` | 明确要预渲染的路径 |
| `crawlLinks` | 是否自动爬取页面内链接继续渲染，当前关闭 |
| `ignore` | 排除的路径 |

要让更多页面静态化：

```ts
prerender: {
  crawlLinks: true,
  routes: ['/', '/about', '/news'],
  ignore: ['/member', '/hi'],   // 会员中心等动态页排除
},
```

> 会员中心、订单等需登录的页面**不要**预渲染。

## 四、页面 SEO

### `useHead`

```vue
<script setup lang="ts">
useHead({
  title: '新闻资讯',
  meta: [
    { name: 'description', content: '最新新闻资讯与行业动态' },
    { name: 'keywords', content: '新闻,资讯,行业动态' },
  ],
});
</script>
```

### 动态标题

详情页标题依赖异步数据时，用 **getter 函数**：

```vue
<script setup lang="ts">
const route = useRoute();

const { data: detail } = await useAsyncData(`news-${route.params.id}`, () =>
  request.get(`/content/article/${route.params.id}`),
);

useHead({
  title: () => detail.value?.title ?? '详情',
  meta: [
    { name: 'description', content: () => detail.value?.summary ?? '' },
  ],
});
</script>
```

> 直接写 `title: detail.value?.title` 在数据未就绪时会取到 `undefined`，必须用函数形式保持响应式。

### `useSeoMeta`（更简洁）

```vue
<script setup lang="ts">
useSeoMeta({
  title: () => detail.value?.title,
  description: () => detail.value?.summary,
  ogTitle: () => detail.value?.title,
  ogDescription: () => detail.value?.summary,
  ogImage: () => detail.value?.cover,
  ogType: 'article',
  twitterCard: 'summary_large_image',
});
</script>
```

### 全局默认

`nuxt.config.ts`：

```ts
app: {
  baseURL: process.env.NUXT_APP_BASE_URL || '/',
  head: {
    htmlAttrs: {
      lang: 'zh-cn',
    },
  },
},
```

可在此补充站点级默认 title、meta：

```ts
head: {
  htmlAttrs: { lang: 'zh-cn' },
  titleTemplate: '%s - 站点名称',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '站点默认描述' },
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
},
```

`titleTemplate: '%s - 站点名称'` 会让页面标题自动拼接站点名。

### 从后端读取 SEO 配置

站点 SEO 信息通常在后台配置，可在布局或插件中统一注入：

```ts
// composables/useSiteSeo.ts
export async function useSiteSeo() {
  const { data: config } = await useAsyncData('site-config', () =>
    request.get('/site/config'),
  );

  useHead({
    titleTemplate: (title) =>
      title ? `${title} - ${config.value?.site_name}` : config.value?.site_name,
    meta: [
      { name: 'description', content: config.value?.seo_description },
      { name: 'keywords', content: config.value?.seo_keywords },
    ],
  });

  return config;
}
```

## 五、结构化数据

```vue
<script setup lang="ts">
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: detail.value?.title,
        datePublished: detail.value?.created_at,
        author: { '@type': 'Person', name: detail.value?.author },
      }),
    },
  ],
});
</script>
```

## 六、robots.txt 与 sitemap

### robots.txt

放到 `public/robots.txt`（原样拷贝到产物根）：

```
User-agent: *
Allow: /
Disallow: /member/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

### sitemap

可用 Nitro 路由动态生成：

```ts
// server/routes/sitemap.xml.ts
export default defineEventHandler(async (event) => {
  const articles = await $fetch('http://127.0.0.1:8500/api/content/article/all');

  const urls = articles.data
    .map((a: any) => `<url><loc>https://example.com/news/${a.id}</loc></url>`)
    .join('');

  setHeader(event, 'content-type', 'text/xml');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap...org/schemas/sitemap/0.9">${urls}</urlset>`;
});
```

## 七、性能优化

### 图片

```vue
<template>
  <img :src="cover" loading="lazy" decoding="async" alt="封面" />
</template>
```

### 组件懒加载

Nuxt 内置 `Lazy` 前缀：

```vue
<template>
  <LazyHeavyChart v-if="show" />
</template>
```

### 依赖预构建

```ts
vite: {
  optimizeDeps: {
    include: ['@wangeditor/editor', '@wangeditor/editor-for-vue'],
  },
},
```

富文本编辑器等大依赖已加入预构建，避免开发期反复优化。

## 八、SEO 检查清单

- [ ] 每个页面都有唯一的 `title` 与 `description`
- [ ] 详情页标题使用 getter 函数形式
- [ ] 配置了 `titleTemplate`
- [ ] `html lang` 正确（当前 `zh-cn`）
- [ ] 图片有 `alt`
- [ ] 配置了 `robots.txt`
- [ ] 提供了 sitemap
- [ ] 需要 SEO 的页面走 SSR 或预渲染（**当前 SPA 模式需评估**）
- [ ] 添加了 Open Graph 标签

## 九、常见问题

| 现象 | 处理 |
| --- | --- |
| 搜索引擎抓不到内容 | SPA 模式无服务端渲染，改 `ssr: true` 或用 `generate` |
| 详情页标题显示 undefined | `useHead` 的 title 要用函数形式 |
| 切 SSR 后报 `window is not defined` | 用 `process.client` 包裹或移到 `onMounted` |
| 切 SSR 后数据请求两次 | 用 `useAsyncData`/`useFetch` 并给固定 key |
| 预渲染时接口报错 | 预渲染发生在构建期，后端必须可访问；动态页应加入 `ignore` |

> 下一节：[3.2.6 前端插件](plugin.md)
