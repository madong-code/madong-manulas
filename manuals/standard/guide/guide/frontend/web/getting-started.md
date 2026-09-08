# 3.2.1 快速上手

## 一、启动

```bash
cd template/web
pnpm install
pnpm dev
```

访问 **http://localhost:3000**。

前置条件：后端已运行（见 [2.2 后端安装](../../install/backend.md)）。

## 二、可用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发模式 |
| `pnpm dev:frontend` | 强制前端路由模式 |
| `pnpm dev:backend` | 强制后端路由模式 |
| `pnpm build` | 生产构建 |
| `pnpm build:frontend` / `pnpm build:backend` | 按路由模式构建 |
| `pnpm build:integrated` | 一体化部署构建 |
| `pnpm generate` | 静态站点生成（SSG） |
| `pnpm preview` | 预览构建产物 |
| `pnpm start` | 运行产物：`node .output/server/index.mjs` |
| `pnpm lint` / `pnpm lint:fix` | 代码检查 |
| `pnpm typecheck` | 类型检查 |

## 三、环境变量

Nuxt 的环境变量约定：

- `NUXT_PUBLIC_` 前缀 → 暴露到客户端，可通过 `useRuntimeConfig().public` 访问
- 无前缀 → **仅服务端可用**

### `.env`（公共）

```ini
NUXT_PUBLIC_DEFAULT_LANG=zh-CN
```

### `.env.development`（开发）

```ini
# API 基础路径
NUXT_PUBLIC_API_BASE_URL=/api

# 请求头配置
NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY=pc
NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY=Authorization

# 默认语言
NUXT_PUBLIC_DEFAULT_LANG=zh-CN

# 默认租户 ID（可选，空则表示不自动注入 X-Tenant-Id）
NUXT_PUBLIC_X_TENANT_ID=1

# 路由菜单模式：frontend | backend | hybrid
NUXT_PUBLIC_ROUTING_MODE=hybrid

# 禁用 OXC 原生绑定（解决 Windows 安全策略问题）
OXC_DISABLE_NATIVE=1
```

### `.env.production`（生产）

```ini
NUXT_APP_BASE_URL=/
NUXT_PUBLIC_API_BASE_URL=/api
NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY=pc
NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY=Authorization
NUXT_PUBLIC_DEFAULT_LANG=zh-CN
NUXT_PUBLIC_X_TENANT_ID=
NUXT_PUBLIC_ROUTING_MODE=hybrid
```

### 变量说明

| 变量 | 说明 |
| --- | --- |
| `NUXT_APP_BASE_URL` | 应用基础路径（资源/路由前缀） |
| `NUXT_PUBLIC_API_BASE_URL` | 接口前缀，开发期由代理转发 |
| `NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY` | 渠道标识，随请求头发送（`pc` / `h5` / `app`） |
| `NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY` | Token 请求头字段名 |
| `NUXT_PUBLIC_DEFAULT_LANG` | 默认语言 |
| `NUXT_PUBLIC_X_TENANT_ID` | 默认租户 ID，**留空则不注入 `X-Tenant-Id`** |
| `NUXT_PUBLIC_ROUTING_MODE` | 路由菜单模式 |
| `OXC_DISABLE_NATIVE` | Windows 下若 OXC 原生绑定被安全策略拦截则设为 `1` |

> Windows 用户若启动报 OXC 相关错误，保留 `OXC_DISABLE_NATIVE=1` 即可。

## 四、路由模式

这是 web 端最重要的配置项，三选一：

| 模式 | 行为 | 适用 |
| --- | --- | --- |
| `frontend` | 前端 `routes.ts` 声明式生成菜单骨架，后端仅裁剪可见性 | 本地联调、页面结构固定 |
| `backend` | 后端接口完全下发菜单 | CMS 场景，运营可自由配置 |
| `hybrid` | 后端菜单为主骨架 + 前端路由补充合并（**默认**） | 兼顾灵活与可控 |

切换方式：

```bash
pnpm dev:frontend      # 或修改 .env 中的 NUXT_PUBLIC_ROUTING_MODE
pnpm dev:backend
```

详见 [3.2.3 页面与路由](pages.md)。

## 五、开发代理

`nuxt.config.ts` 的 `vite.server.proxy` 中已配置代理：

```ts
vite: {
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8500",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/upload": {
        target: "http://127.0.0.1:8500",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, "/upload"),
      },
    },
  },
},
```

后端端口不同时改这里的 `target`。

## 六、新增一个页面

### 1. 建页面文件

`src/pages/about/index.vue`

```vue
<script setup lang="ts">
useHead({
  title: '关于我们',
  meta: [{ name: 'description', content: '公司简介与联系方式' }],
});
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10">
    <h1 class="text-3xl font-bold">关于我们</h1>
    <p class="mt-4 text-gray-600">这里是公司简介。</p>
  </div>
</template>
```

Nuxt 文件路由自动生成 `/about`。

### 2. 在 `routes.ts` 中声明菜单

`src/pages/routes.ts`

```ts
export const routes: AppRouteDefinition[] = [
  // ...
  {
    path: '/about',
    name: 'about',
    meta: {
      title: '关于我们',
      code: 'about',
      order: 90,
      showInMenu: true,
    },
  },
];
```

> `frontend` / `hybrid` 模式下菜单据此生成；`backend` 模式下菜单完全由后端下发。

### 3. 调接口

```vue
<script setup lang="ts">
import { request } from '~/api/request';

const { data } = await useAsyncData('about', () => request.get('/site/about'));
</script>
```

## 七、常见起步问题

| 现象 | 处理 |
| --- | --- |
| 接口 404 | 检查 `nuxt.config.ts` 的 `devProxy.target` 与后端端口 |
| Windows 启动报 OXC 错误 | 确保 `.env.development` 中有 `OXC_DISABLE_NATIVE=1` |
| 菜单不显示新页面 | `hybrid`/`backend` 模式下需后端配置；或临时改用 `frontend` 模式 |
| 多租户数据串了 | 检查 `NUXT_PUBLIC_X_TENANT_ID` |
| 样式不生效 | 确认 UnoCSS 类名是否被扫描到（动态拼接的类名需要 safelist） |

> 下一节：[3.2.2 目录结构](directory.md)
