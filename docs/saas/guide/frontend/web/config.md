# 配置体系

## 配置文件概览

```
template/web/
├── .env                  # 全环境生效
├── .env.development       # 开发环境
├── .env.production        # 生产环境
├── nuxt.config.ts        # Nuxt 核心配置
├── tsconfig.json         # TypeScript 配置
└── uno.config.ts         # UnoCSS 配置
```

## 环境变量（.env）

Nuxt 4 使用 **运行时配置（Runtime Config）** 管理环境变量，需要在 `.env` 文件中定义以 `NUXT_PUBLIC_` 为前缀的变量。

### 开发环境（.env.development）

```ini
# API 基础地址
NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8500/api

# 请求头配置
NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY=pc
NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY=Authorization

# 默认语言
NUXT_PUBLIC_DEFAULT_LANG=zh-CN

# 默认租户 ID（留空则自动从 store 读取）
NUXT_PUBLIC_X_TENANT_ID=
```

### 生产环境（.env.production）

```ini
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY=pc
NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY=Authorization
NUXT_PUBLIC_DEFAULT_LANG=zh-CN
NUXT_PUBLIC_X_TENANT_ID=
```

### 变量说明

| 变量名 | 类型 | 说明 | 默认值 |
|---------|------|------|--------|
| `NUXT_PUBLIC_API_BASE_URL` | `string` | 后端 API 基础地址 | `/api` |
| `NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY` | `string` | 渠道标识请求头 Key | `pc` |
| `NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY` | `string` | Token 请求头 Key | `Authorization` |
| `NUXT_PUBLIC_DEFAULT_LANG` | `string` | 默认语言 | `zh-CN` |
| `NUXT_PUBLIC_X_TENANT_ID` | `string` | 默认租户 ID |（空） |

> 📌 `NUXT_PUBLIC_` 前缀的变量会**暴露给客户端**，在浏览器中可通过 `useRuntimeConfig().public` 访问。

## Nuxt 配置（nuxt.config.ts）

### 基本配置

```ts
export default defineNuxtConfig({
  // 启用 src/ 目录布局（Nuxt 4 推荐）
  srcDir: 'src',

  // 应用基础路径
  app: {
    baseURL: '/web',
    head: {
      htmlAttrs: { lang: 'zh-cn' }
    }
  },

  // 运行时配置（读取 .env）
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
      REQUEST_HEADER_CHANNEL_KEY: process.env.NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY || 'pc',
      REQUEST_HEADER_TOKEN_KEY: process.env.NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY || 'Authorization',
      DEFAULT_LANG: process.env.NUXT_PUBLIC_DEFAULT_LANG || 'zh-CN',
      X_TENANT_ID: process.env.NUXT_PUBLIC_X_TENANT_ID || '',
    },
  },
})
```

### 模块配置

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',          // ESLint 集成
    '@vueuse/nuxt',         // VueUse 自动导入
    '@unocss/nuxt',         // UnoCSS 原子化 CSS
    '@pinia/nuxt',          // Pinia 状态管理
    '@element-plus/nuxt',    // Element Plus 集成
    'nuxt-icons',            // 图标组件
    'pinia-plugin-persistedstate/nuxt', // Pinia 持久化
  ],
})
```

### Vite 配置

```ts
export default defineNuxtConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Element Plus 样式定制
          additionalData: `@use "@/assets/scss/element/index.scss" as element;`
        },
      },
    },
    server: {
      // 开发代理（解决跨域）
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8500",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
        "/upload": {
          target: "http://127.0.0.1:8500",
          changeOrigin: true,
        },
      },
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ['@wangeditor/editor', '@wangeditor/editor-for-vue'],
    },
  },
})
```

### Nitro 配置

```ts
export default defineNuxtConfig({
  nitro: {
    // ESBuild 配置
    esbuild: {
      options: { target: 'esnext' },
    },
    // 预渲染配置（静态站点生成时使用）
    prerender: {
      crawlLinks: false,
      routes: ['/'],
      ignore: ['/hi'],
    },
  },
})
```

### Element Plus 配置

```ts
export default defineNuxtConfig({
  elementPlus: {
    icon: 'ElIcon',           // 全局注册 Icon 组件
    importStyle: 'scss',      // 使用 SCSS 样式（支持主题定制）
    themes: ['dark'],          // 启用深色主题
  },
  ssr: false,                 // 禁用 SSR（纯客户端渲染）
})
```

## TypeScript 配置（tsconfig.json）

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "paths": {
      "~/": ["./src/"],
      "~~/": ["./"],
      "@/*": ["./src/*"]
    }
  }
}
```

## UnoCSS 配置（uno.config.ts）

```ts
import { defineConfig } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',  // 主色
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      }
    }
  },
  shortcuts: [
    // 自定义快捷类
  ],
  transformers: [
    transformerDirectives(),  // 支持 @apply 指令
  ],
})
```

## 在代码中读取配置

```ts
// 在组件或组合式函数中
const runtimeConfig = useRuntimeConfig()

// 读取公共配置（客户端 + 服务端均可访问）
const apiBaseUrl = runtimeConfig.public.API_BASE_URL
const defaultLang = runtimeConfig.public.DEFAULT_LANG

// 读取请求头配置
const channelKey = runtimeConfig.public.REQUEST_HEADER_CHANNEL_KEY
const tokenKey = runtimeConfig.public.REQUEST_HEADER_TOKEN_KEY
```
