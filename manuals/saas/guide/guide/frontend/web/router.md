# 路由系统

## 概述

`template/web` 使用 **Nuxt 文件系统路由**，同时支持**手动路由定义**和**插件路由动态加载**。

## 文件系统路由（自动生成）

Nuxt 会根据 `pages/` 目录结构**自动生成路由**：

```
pages/
├── index.vue           → /web
├── member/
│   ├── profile.vue    → /web/member/profile
│   └── settings.vue   → /web/member/settings
└── auth/
    ├── login.vue      → /web/auth/login
    └── register.vue   → /web/auth/register
```

## 手动路由定义（pages/routes.ts）

对于需要**自定义路由配置**（如 meta、keepAlive）的页面，在 `pages/routes.ts` 中定义：

```ts
// src/pages/routes.ts
const routes = [
  {
    path: '/',
    name: 'web-home',
    component: () => import('~/pages/index.vue'),
    meta: {
      title: '首页',
      keepAlive: false,
      requiresAuth: false,
    },
  },
  {
    path: '/member/profile',
    name: 'web-member-profile',
    component: () => import('~/pages/member/profile.vue'),
    meta: {
      title: '个人资料',
      keepAlive: true,
      requiresAuth: true,  // 需要登录
    },
  },
]

export default routes
```

## 插件路由动态加载（router.options.ts）

`router.options.ts` 会**自动扫描并加载插件路由**：

```ts
// src/router.options.ts
const pluginRoutes = import.meta.glob('~/plugin/**/pages/routes.ts', {
  eager: true,
})

// 插件路由会插入到主路由前面
const finalRoutes = [...routes]
for (const key in pluginRoutes) {
  const addonModule = pluginRoutes[key]
  if (addonModule?.default) {
    const addon = key.split('/')[2]
    const processedRoutes = addonModule.default.map((item) => {
      item.meta = item.meta
        ? Object.assign(item.meta, { addon })
        : { addon }
      return item
    })
    finalRoutes.unshift(...processedRoutes)
  }
}
```

**插件路由规则**：
- 插件放在 `src/plugin/<插件名>/` 目录下
- 路由文件必须为 `pages/routes.ts`
- 路由会自动添加 `meta.addon` 标识

## 路由守卫（middleware/）

### 全局守卫（middleware/global.ts）

```ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 设置页面标题
  useHead({
    title: to.meta.title || 'Madong',
  })

  // 设置面包屑（如果有）
  // ...
})
```

### 认证守卫（middleware/auth.ts）

```ts
export default defineNuxtRouteMiddleware((to, from) => {
  const memberStore = useMemberStore()

  // 检查页面是否需要登录
  if (to.meta.requiresAuth && !memberStore.isLogin) {
    // 未登录，跳转到登录页
    return navigateTo('/auth/login?redirect=' + to.fullPath)
  }
})
```

在页面中使用守卫：

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],  // 使用 auth 守卫
  requiresAuth: true,      // 标记需要登录
})
</script>
```

## 布局系统

Nuxt 使用 `layouts/` 目录自动生成布局，**无需手动注册**：

| 布局文件 | 说明 | 使用场景 |
|-----------|------|------------|
| `default.vue` | 默认布局（页头 + 侧边栏 + 内容 + 页脚） | 首页、文章页等 |
| `blank.vue` | 空白布局（无页头页脚） | 登录页、注册页 |
| `container.vue` | 容器布局 | 需要容器包裹的页面 |
| `member.vue` | 会员中心布局（侧边栏 + 内容） | 会员中心各页面 |

在页面中指定布局：

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'member',  // 使用 member 布局
})
</script>
```

## 编程式导航

```ts
// 跳转到指定页面
navigateTo('/member/profile')

// 带查询参数
navigateTo({
  path: '/member/profile',
  query: { tab: 'basic' }
})

// 替换当前历史记录（不保留后退）
navigateTo('/member/profile', { replace: true })

// 返回上一页
history.back()
```

## 路由工具函数（utils/router.ts）

```ts
// src/utils/router.ts
export function getRedirectUrl(): string {
  const route = useRoute()
  return (route.query.redirect as string) || '/'
}

export function routerBackOrTo(path: string) {
  if (history.length > 1) {
    history.back()
  } else {
    navigateTo(path)
  }
}
```

## Meta 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 页面标题 |
| `keepAlive` | `boolean` | 是否缓存页面（Keep-Alive） |
| `requiresAuth` | `boolean` | 是否需要登录 |
| `addon` | `string` | 插件标识（插件路由自动添加） |
| `hidden` | `boolean` | 是否在菜单中隐藏 |
| `icon` | `string` | 菜单图标 |
| `order` | `number` | 菜单排序权重 |
