# 布局系统

## 概述

Nuxt 使用 `layouts/` 目录**自动注册布局**，在页面中通过 `definePageMeta({ layout: 'xxx' })` 指定使用的布局。

## 布局文件结构

```
src/layouts/
├── default.vue          # 默认布局（页头 + 侧边栏 + 内容 + 页脚）
├── blank.vue           # 空白布局（无页头页脚）
├── container.vue       # 容器布局（居中容器）
├── member.vue         # 会员中心布局（侧边栏 + 内容）
└── components/        # 布局子组件
    ├── header.vue      # 页头
    ├── footer.vue      # 页脚
    ├── aside.vue       # 侧边栏
    ├── menu.vue       # 菜单
    ├── menu-sub.vue   # 子菜单
    ├── dark-switch.vue # 深色模式切换
    ├── dark-toggle.vue # 深色模式开关
    ├── logo.vue       # Logo
    ├── header-actions.vue # 页头操作区
    └── mobile-drawer.vue  # 移动端抽屉菜单
```

## 默认布局（default.vue）

适用于首页、文章页等需要完整页面结构的页面。

```
┌─────────────────────────────────┐
│  header.vue（页头）              │
├──────────┬──────────────────┤
│ aside.vue │  page content      │
│（侧边栏）│  （页面内容）      │
│           │                    │
├──────────┴──────────────────┤
│  footer.vue（页脚）              │
└─────────────────────────────────┘
```

在页面中使用：

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>
```

## 空白布局（blank.vue）

适用于登录页、注册页、错误页等不需要页头页脚的页面。

```vue
<template>
  <div class="blank-layout">
    <slot />  <!-- 页面内容直接渲染 -->
  </div>
</template>
```

在页面中使用：

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
</script>
```

## 会员中心布局（member.vue）

适用于会员中心各页面，包含侧边栏导航和内容区。

```
┌─────────────────────────────────┐
│  header.vue（页头，简化版）      │
├──────────┬──────────────────┤
│ 菜单       │  页面内容          │
│ - 个人资料 │                    │
│ - 密码修改 │                    │
│ - 余额     │                    │
│ - 积分     │                    │
│ - 设置     │                    │
│ - 签到     │                    │
└──────────┴──────────────────┘
```

在页面中使用：

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'member',
  middleware: ['auth'],  // 会员页面需要登录
  requiresAuth: true,
})
</script>
```

## 容器布局（container.vue）

适用于需要居中容器的页面，如关于我们、联系我们等。

```vue
<template>
  <div class="container-layout">
    <header />
    <main class="container mx-auto px-4">
      <slot />
    </main>
    <footer />
  </div>
</template>
```

## 布局组件说明

### header.vue（页头）

包含以下元素：

- **Logo** — 点击回到首页
- **导航菜单** — 首页、关于、联系我们等
- **语言切换** — 中/英文切换
- **深色模式切换** — 浅色/深色切换
- **登录按钮** — 未登录时显示
- **用户头像** — 已登录时显示（点击下拉菜单）

### aside.vue（侧边栏）

会员中心布局的侧边栏，包含：

- 用户头像和昵称
- 导航菜单（个人资料、密码修改、余额、积分、设置、签到）

### menu.vue（菜单）

递归渲染导航菜单，支持多级菜单。

### mobile-drawer.vue（移动端抽屉）

移动端时，侧边栏变为抽屉式菜单，点击汉堡按钮展开。

## 自定义布局

如果需要创建新的布局：

1. 在 `src/layouts/` 下创建 Vue 文件（如 `custom.vue`）
2. 在布局组件中使用 `<slot />` 渲染页面内容
3. 在页面中通过 `definePageMeta({ layout: 'custom' })` 使用

```vue
<!-- src/layouts/custom.vue -->
<template>
  <div class="custom-layout">
    <header>自定义页头</header>
    <main>
      <slot />  <!-- 页面内容 -->
    </main>
    <footer>自定义页脚</footer>
  </div>
</template>
```

## 动态切换布局

可以在页面中动态切换布局：

```vue
<script setup lang="ts">
const layout = ref('default')

function switchLayout() {
  layout.value = layout.value === 'default' ? 'blank' : 'default'
}
</script>

<template>
  <div>
    <button @click="switchLayout">切换布局</button>
    <NuxtLayout :name="layout">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

## 布局与路由 Meta 的关系

| Meta 字段 | 说明 | 示例 |
|-----------|------|------|
| `layout` | 指定布局名称 | `layout: 'member'` |
| `requiresAuth` | 是否需要登录 | `requiresAuth: true` |
| `title` | 页面标题 | `title: '个人资料'` |
| `keepAlive` | 是否缓存页面 | `keepAlive: true` |

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'member',
  middleware: ['auth'],
  requiresAuth: true,
  title: '个人资料',
  keepAlive: true,
})
</script>
```
