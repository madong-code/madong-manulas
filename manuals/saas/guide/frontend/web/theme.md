# 主题系统

## 概述

`template/web` 支持**深色模式（Dark Mode）** 和**浅色模式（Light Mode）** 切换，基于 Element Plus 的主题系统和 UnoCSS 实现。

## 技术实现

| 层级 | 实现方式 |
|------|----------|
| Element Plus 组件 | `element-plus/nuxt` 模块的 `themes: ['dark']` 配置 |
| 自定义 SCSS | `src/assets/scss/dark.scss` 深色变量覆盖 |
| UnoCSS 原子类 | `uno.config.ts` 的 `dark:` 变体 |

## 配置（nuxt.config.ts）

```ts
export default defineNuxtConfig({
  elementPlus: {
    importStyle: 'scss',    // 使用 SCSS 样式（支持主题定制）
    themes: ['dark'],     // 启用深色主题
  },
})
```

## 样式文件

### Element Plus 主题定制

```
src/assets/scss/element/
├── index.scss          # 主入口（引入 light 和 dark）
├── dark.scss          # 深色模式变量覆盖
└── light.scss         # 浅色模式变量（默认）
```

```scss
// src/assets/scss/element/index.scss
@use 'element/light';
@use 'element/dark';

// 深色模式时自动应用 dark 变量
html.dark {
  @include dark.theme;
}
```

### 全局样式

```scss
// src/assets/scss/dark.scss
// 深色模式下的全局样式覆盖
html.dark {
  --bg-color: #141414;
  --text-color: #e5e5e5;
  --border-color: #303030;

  body {
    background-color: var(--bg-color);
    color: var(--text-color);
  }
}
```

## 切换主题（composables/dark.ts）

```ts
// src/utils/dark.ts
import { useColorMode } from '@nuxtjs/color-mode'

export function useDark() {
  const { colorMode, preference } = useColorMode()

  // 当前是否为深色模式
  const isDark = computed(() => colorMode.value === 'dark')

  // 切换主题
  function toggleDark() {
    colorMode.preference = isDark.value ? 'light' : 'dark'
  }

  // 设置主题
  function setDark(value: boolean) {
    colorMode.preference = value ? 'dark' : 'light'
  }

  return { isDark, toggleDark, setDark }
}
```

## 在组件中使用

### 方式一：使用组合式函数

```vue
<template>
  <el-switch
    :model-value="isDark"
    @change="setDark"
    active-text="深色"
    inactive-text="浅色"
  />
</template>

<script setup lang="ts">
import { useDark } from '~/utils/dark'

const { isDark, setDark } = useDark()
</script>
```

### 方式二：使用组件（layouts/components/dark-switch.vue）

```vue
<template>
  <el-tooltip :content="isDark ? '浅色模式' : '深色模式'">
    <el-button circle @click="toggleDark()">
      <el-icon v-if="isDark" :size="16"><Sunny /></el-icon>
      <el-icon v-else :size="16"><Moon /></el-icon>
    </el-button>
  </el-tooltip>
</template>
```

## UnoCSS 深色模式适配

在 `uno.config.ts` 中配置 `dark:` 变体后，可以在 class 中使用：

```html
<!-- 浅色模式下背景白色，深色模式下背景深灰色 -->
<div class="bg-white dark:bg-gray-800">
  内容
</div>

<!-- 浅色模式下文字黑色，深色模式下文字白色 -->
<span class="text-black dark:text-white">文本</span>
```

## Element Plus 组件深色适配

Element Plus 会在 `<html class="dark">` 时自动切换为深色主题，无需额外配置。

如果需要手动控制某个组件的暗黑模式：

```vue
<template>
  <!-- 强制使用深色主题 -->
  <el-config-provider :theme="isDark ? 'dark' : 'light'">
    <el-button>按钮</el-button>
  </el-config-provider>
</template>
```

## 持久化主题偏好

使用 `@nuxtjs/color-mode` 模块，主题偏好会自动持久化到 `localStorage` 的 `nuxt-color-mode` 键中。

手动持久化（如果需要）：

```ts
// 切换主题时同时存储到 Pinia
function setDark(value: boolean) {
  colorMode.preference = value ? 'dark' : 'light'
  const configStore = useConfigStore()
  configStore.theme = value ? 'dark' : 'light'
}
```

## 系统主题跟随

`@nuxtjs/color-mode` 支持跟随系统主题：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  colorMode: {
    preference: 'system',  // 跟随系统
    fallback: 'light',     // 系统不支持时的回退
  },
})
```

用户可以在设置中选择：

- **浅色** — 强制浅色模式
- **深色** — 强制深色模式
- **跟随系统** — 根据操作系统主题自动切换

## 注意事项

- 切换主题后，页面会**自动刷新**以重新应用样式（部分浏览器可能不会自动刷新）
- 深色模式的颜色变量需要在 `dark.scss` 中手动定义
- UnoCSS 的 `dark:` 变体需要浏览器支持 `prefers-color-scheme` 媒体查询
- 如果使用了自定义组件，需要手动适配深色模式样式
