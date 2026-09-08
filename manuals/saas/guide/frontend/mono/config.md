# Mono 共享配置

本文介绍 Madong 前端 Mono 项目（`template/mono`）三个应用（admin / platform / install）**共用的配置体系**。各应用差异化配置（端口、接口前缀等）见各应用自身的 config 文档。

## 配置体系概览

三个应用都是 Vite + Vue 应用，配置通过 **`.env` 系列环境变量 + 各应用 `vite.config.ts`** 完成：

```
template/mono/apps/{admin,platform,install}/
├── .env                   # 所有模式共用（应用标题、命名空间、store 密钥、离线图标）
├── .env.development       # 开发模式（端口、接口前缀、WSS、Mock、devtools）
├── .env.production        # 生产构建（base、接口前缀、压缩、PWA、路由历史）
├── .env.integrated        # 一体化部署构建（与后端同域）
├── .env.analyze           # 构建产物体积分析
└── vite.config.ts         # Vite 配置（代理、插件、别名）
```

> 依赖安装与启动均在 `template/mono` 根目录进行，见 [Mono 快速开始](./quickstart.md)。

## 环境变量

### `.env`（所有模式共用）

```ini
# 应用标题（浏览器标签、登录页等）
VITE_APP_TITLE=MDAdmin-Saas

# 应用命名空间（缓存/store 前缀，多项目隔离，各应用必须不同）
VITE_APP_NAMESPACE=madong-admin-ele

# store 持久化加密密钥（生产环境务必替换）
VITE_APP_STORE_SECURE_KEY=please-replace-me-with-your-own-key

# 是否启用离线图标
VITE_APP_ICON_OFFLINE=false
```

> 🔑 **命名空间隔离**：admin / platform / install 必须使用不同的 `VITE_APP_NAMESPACE`（如 `madong-admin-ele` / `madong_platform` / `madong-install`），否则 localStorage/store 缓存互相覆盖。

### `.env.development`（开发模式）

```ini
# 开发服务器端口（各应用不同）
VITE_PORT=5777

# 基础路径
VITE_BASE=/

# 接口前缀（各应用不同：/adminapi | /platformapi）
VITE_GLOB_API_URL=/adminapi

# Webman Push（仅 admin 启用）
VITE_GLOB_ENABLE_WSS=true
VITE_GLOB_WSS_URL=ws://127.0.0.1:3501
VITE_GLOB_WSS_APPKEY=60756ede2a9737a05384aad849e220f8

# Nitro Mock（admin 开发默认开启）
VITE_NITRO_MOCK=true

# 是否打开 devtools
VITE_DEVTOOLS=false

# 是否注入全局 loading
VITE_INJECT_APP_LOADING=true
```

### `.env.production`（生产构建）

```ini
VITE_BASE=/
VITE_GLOB_API_URL=/adminapi
VITE_COMPRESS=none            # none | brotli | gzip
VITE_PWA=false
VITE_ROUTER_HISTORY=hash      # hash | history
VITE_INJECT_APP_LOADING=true
VITE_ARCHIVER=false           # 是否生成 dist.zip
```

## 接口前缀

三个应用通过 `VITE_GLOB_API_URL` 区分对接的后端路由组，Vite 代理据此转发到后端 `8500`：

| 应用 | 接口前缀 | 后端路由组 | 代理目标 |
| --- | --- | --- | --- |
| admin | `/adminapi` | adminapi | `http://127.0.0.1:8500/adminapi` |
| platform | `/platformapi` | platformapi | `http://127.0.0.1:8500/platformapi` |
| install | `/adminapi` | adminapi/install | `http://127.0.0.1:8500/adminapi` |

> 后端监听 `8500`（见 `backend/config/process.php`），若端口不同需同步修改各应用 `vite.config.ts` 的代理 `target`。

## Vite 代理配置

以 admin 为例，`apps/admin/vite.config.ts` 中配置开发代理：

```ts
server: {
  proxy: {
    '/adminapi': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/adminapi/, ''),
      target: 'http://127.0.0.1:8500/adminapi',
      ws: true,
    },
    '/upload': {
      changeOrigin: true,
      target: 'http://127.0.0.1:8500',
    },
  },
},
```

platform 将 `/adminapi` 换成 `/platformapi` 并指向 `/platformapi` 即可。

## 构建配置

各应用构建脚本（进入 `apps/{app}` 或 mono 根 `pnpm -F @madong/{app} build`）：

| 命令 | 模式 | 产物 |
| --- | --- | --- |
| `pnpm dev` | development | 开发服务器 |
| `pnpm build` | production | `apps/{app}/dist/` |
| `pnpm build:integrated` | integrated | `backend/public/{admin,platform,install}`（与后端同域） |
| `pnpm build:analyze` | analyze | 构建 + 体积分析 |
| `pnpm preview` | — | 预览构建产物 |
| `pnpm typecheck` | — | `vue-tsc` 类型检查 |

## 常用配置项速查

| 环境变量 | 作用 | 说明 |
| --- | --- | --- |
| `VITE_PORT` | 开发端口 | 各应用不同 |
| `VITE_BASE` | 部署基础路径 | 子路径部署时改 |
| `VITE_GLOB_API_URL` | 接口前缀 | 各应用不同 |
| `VITE_APP_NAMESPACE` | store 缓存前缀 | 各应用必须不同 |
| `VITE_APP_STORE_SECURE_KEY` | store 加密密钥 | 生产必须替换 |
| `VITE_COMPRESS` | 构建压缩 | none/brotli/gzip |
| `VITE_ROUTER_HISTORY` | 路由历史模式 | hash/history |
| `VITE_NITRO_MOCK` | 是否启用 Mock | admin 默认 true |

## 常见问题

### 1. 修改端口后不生效

确保修改的是 `apps/{app}/.env.development` 的 `VITE_PORT`，并重启 dev server。

### 2. API 代理失败

- 检查 `VITE_GLOB_API_URL` 是否与应用匹配（admin=/adminapi、platform=/platformapi）
- 检查 `vite.config.ts` 代理 `target` 是否指向后端实际端口
- 确认后端服务已启动

### 3. store 互相覆盖

检查各应用 `VITE_APP_NAMESPACE` 是否不同。

## 各应用差异配置

- [Admin 系统配置](./admin/config.md) — 端口 5777、`/adminapi`、多租户 `X-Tenant-Id`
- [Platform 系统配置](./platform/config.md) — 端口 5500、`/platformapi`、无多租户
