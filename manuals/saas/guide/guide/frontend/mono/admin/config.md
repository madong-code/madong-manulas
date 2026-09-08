# Admin 系统配置

Admin 应用（`template/mono/apps/admin`）的**差异化配置**。与环境变量、代理、构建相关的**公共配置**见 [Mono 共享配置](../config.md)。

## 应用信息

| 项 | 值 |
| --- | --- |
| 包名 | `@madong/admin` |
| 路径 | `template/mono/apps/admin` |
| 开发端口 | `5777`（`VITE_PORT`） |
| 接口前缀 | `/adminapi` |
| 后端代理 | `http://127.0.0.1:8500/adminapi` |
| 多租户 | 是（请求注入 `X-Tenant-Id`） |

## 环境变量

admin 的环境变量文件位于 `apps/admin/`，包括 `.env`、`.env.development`、`.env.production`、`.env.integrated`、`.env.analyze`。公共项的说明见 [Mono 共享配置](../config.md)。

### 命名空间（必须与其它应用不同）

```env
# apps/admin/.env
VITE_APP_TITLE=MDAdmin-Saas
VITE_APP_NAMESPACE=madong-admin-ele
VITE_APP_STORE_SECURE_KEY=please-replace-me-with-your-own-key
```

### 开发环境

```env
# apps/admin/.env.development
VITE_PORT=5777
VITE_BASE=/
VITE_GLOB_API_URL=/adminapi

# Webman Push
VITE_GLOB_ENABLE_WSS=true
VITE_GLOB_WSS_URL=ws://127.0.0.1:3501
VITE_GLOB_WSS_APPKEY=60756ede2a9737a05384aad849e220f8

VITE_NITRO_MOCK=true
VITE_DEVTOOLS=false
VITE_INJECT_APP_LOADING=true
```

### 生产环境

```env
# apps/admin/.env.production
VITE_BASE=/
VITE_GLOB_API_URL=/adminapi
VITE_COMPRESS=none
VITE_PWA=false
VITE_ROUTER_HISTORY=hash
VITE_INJECT_APP_LOADING=true
VITE_ARCHIVER=false
```

> 生产环境请务必替换 `VITE_APP_STORE_SECURE_KEY`。

## 开发代理

`apps/admin/vite.config.ts` 中代理到后端（**若后端不在 `127.0.0.1:8500`，请修改 `target`**）：

```typescript
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

## 多租户 X-Tenant-Id 注入

Admin 的请求层在请求拦截器中注入租户 ID（`apps/admin/src/api/request.ts`）：

```typescript
// apps/admin/src/api/request.ts
client.addRequestInterceptor({
  fulfilled: async (config) => {
    config.headers.Authorization = formatToken(accessStore.accessToken);
    config.headers['Accept-Language'] = preferences.app.locale;

    // Multi-tenant: inject tenant ID (skip for SaaS management interfaces)
    if (
      accessStore.tenantId &&
      !config.url?.startsWith('/tenant') &&
      !config.url?.startsWith('/db-settings') &&
      !config.url?.startsWith('/db-drivers') &&
      !config.url?.startsWith('/subscription')
    ) {
      config.headers['X-Tenant-Id'] = String(accessStore.tenantId);
    }

    return config;
  },
});
```

**排除列表**（不注入租户头的接口）：
- `/tenant` - 租户管理
- `/db-settings` - 数据库配置
- `/db-drivers` - 数据库驱动
- `/subscription` - 订阅管理

## 常见问题

### 1. API 代理失败

- 检查 `VITE_GLOB_API_URL` 是否为 `/adminapi`
- 检查 `vite.config.ts` 代理 `target` 是否指向后端实际端口
- 确认后端服务已启动

### 2. 多租户头未注入

- 确认 `accessStore.tenantId` 有值
- 检查请求 URL 是否不在排除列表中

### 3. WebSocket 连接失败

- 检查 `VITE_GLOB_ENABLE_WSS`、`VITE_GLOB_WSS_URL`、`VITE_GLOB_WSS_APPKEY` 是否正确
- 确认后端 Webman Push（3501）已启动

## 下一步

- [Mono 共享配置](../config.md)
- [Admin 应用介绍](./intro.md)
- [Admin 路由与菜单](./route-menu.md)
