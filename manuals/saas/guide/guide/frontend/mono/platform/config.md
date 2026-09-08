# Platform 系统配置

Platform 应用（`template/mono/apps/platform`）的**差异化配置**。与环境变量、代理、构建相关的**公共配置**见 [Mono 共享配置](../config.md)。

## 应用信息

| 项 | 值 |
| --- | --- |
| 包名 | `@madong/platform` |
| 路径 | `template/mono/apps/platform` |
| 开发端口 | `5500`（`VITE_PORT`） |
| 接口前缀 | `/platformapi` |
| 后端代理 | `http://127.0.0.1:8500/platformapi` |
| 多租户 | 否（平台级管理，无 `X-Tenant-Id`） |

## 环境变量

platform 的环境变量文件位于 `apps/platform/`，包括 `.env`、`.env.development`、`.env.production`、`.env.integrated`、`.env.analyze`。公共项的说明见 [Mono 共享配置](../config.md)。

### 命名空间（必须与其它应用不同）

```env
# apps/platform/.env
VITE_APP_TITLE=MDPlatform-Saas
VITE_APP_NAMESPACE=madong-platform-ele
VITE_APP_STORE_SECURE_KEY=please-replace-me-with-your-own-key
```

### 开发环境

```env
# apps/platform/.env.development
VITE_PORT=5500
VITE_BASE=/
VITE_GLOB_API_URL=/platformapi

VITE_NITRO_MOCK=true
VITE_DEVTOOLS=false
VITE_INJECT_APP_LOADING=true
```

> Platform 不启用 Webman Push，无需 `VITE_GLOB_ENABLE_WSS` / `VITE_GLOB_WSS_URL`。

### 生产环境

```env
# apps/platform/.env.production
VITE_BASE=/
VITE_GLOB_API_URL=/platformapi
VITE_COMPRESS=none
VITE_PWA=false
VITE_ROUTER_HISTORY=hash
VITE_INJECT_APP_LOADING=true
VITE_ARCHIVER=false
```

> 生产环境请务必替换 `VITE_APP_STORE_SECURE_KEY`。

## 开发代理

`apps/platform/vite.config.ts` 中代理到后端 `/platformapi`（**若后端不在 `127.0.0.1:8500`，请修改 `target`**）：

```typescript
server: {
  proxy: {
    '/platformapi': {
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/platformapi/, ''),
      target: 'http://127.0.0.1:8500/platformapi',
      ws: true,
    },
  },
},
```

## 与 Admin 配置差异

| 项 | Admin | Platform |
| --- | --- | --- |
| 端口 | 5777 | 5500 |
| 接口前缀 | `/adminapi` | `/platformapi` |
| 代理目标 | `/adminapi` | `/platformapi` |
| 多租户 | 有（`X-Tenant-Id`） | 无 |
| Webman Push | 有（WSS） | 无 |

## 常见问题

### 1. API 代理失败

- 检查 `VITE_GLOB_API_URL` 是否为 `/platformapi`
- 检查 `vite.config.ts` 代理 `target` 是否指向后端实际端口
- 确认后端服务已启动

### 2. 与 admin 的 store 冲突

- 确认 `VITE_APP_NAMESPACE` 与 admin 不同

## 下一步

- [Mono 共享配置](../config.md)
- [Platform 应用介绍](./intro.md)
- [Platform 路由与菜单](./route-menu.md)
