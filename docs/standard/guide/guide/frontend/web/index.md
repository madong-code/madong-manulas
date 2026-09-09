# 3.2 web 门户端

`template/web` 是面向终端访客的门户站点，基于 **Nuxt 4**。

## 3.2.1 特点

| 特点 | 说明 |
| --- | --- |
| Nuxt 4 | `srcDir: 'src'`，`compatibilityVersion: 4`，当前 `ssr: false` |
| 三种路由模式 | `frontend` / `backend` / `hybrid`，通过环境变量切换 |
| 可插拔插件 | `src/plugin/<name>/plugins/*.ts` 自动纳入 Nuxt 插件 |
| 多租户 | 请求自动注入 `X-Tenant-Id`，支持请求级覆盖 |
| 完整鉴权 | Token 刷新 + 并发请求队列 |
| Element Plus | SCSS 按需引入，支持 `dark` 主题 |
| UnoCSS | 原子化 CSS |

## 3.2.2 与 admin 的差异

| 维度 | admin | web |
| --- | --- | --- |
| 框架 | Vue 3 + Vite（SPA） | Nuxt 4 |
| 别名 | `#/` → `src/` | `~/` → `src/` |
| 接口前缀 | `/adminapi` | `/api` |
| 对应后端 | `app/adminapi` | `app/api` |
| 请求封装 | `requestClient`（axios） | `request`（fetch 封装的 `Http` 类） |
| 核心场景 | 表格、表单、CRUD | 内容展示、会员中心、SEO |
| 权限 | 完整 RBAC（路由/按钮/接口） | 以登录态 + 页面 `code` 为主 |

## 3.2.3 目录速览

```
template/web/
├── src/
│   ├── api/            接口层（request.ts + 各业务模块）
│   ├── pages/          页面（含 routes.ts 声明式路由）
│   ├── layouts/        布局
│   ├── components/     组件
│   ├── composables/    组合式函数
│   ├── stores/         Pinia
│   ├── router/         路由扩展
│   ├── middleware/     路由中间件
│   ├── plugins/        Nuxt 插件
│   ├── plugin/         可插拔业务插件
│   ├── lang/           语言包
│   ├── assets/         样式与资源
│   ├── types/          类型
│   ├── utils/          工具
│   ├── app.vue
│   └── router.options.ts
├── public/
├── scripts/
├── nuxt.config.ts
├── uno.config.ts
├── Dockerfile
├── .env / .env.development / .env.production / .env.integrated
└── package.json
```

## 3.2.4 本章导航

| 小节 | 内容 |
| --- | --- |
| [3.2.1 快速上手](getting-started.md) | 安装、启动、代理、路由模式 |
| [3.2.2 目录结构](directory.md) | 各目录职责 |
| [3.2.3 页面与路由](pages.md) | 三种路由模式、`routes.ts`、meta 字段 |
| [3.2.4 请求与状态](request.md) | `Http` 类、Token 刷新、多租户、SSE、Pinia |
| [3.2.5 渲染与 SEO](seo.md) | SSR/SPA/SSG、`useHead`、预渲染 |
| [3.2.6 前端插件](plugin.md) | `src/plugin/` 可插拔机制 |

> 下一节：[3.2.1 快速上手](getting-started.md)
