# 2.3 前端安装

前端共四个可独立运行的应用，按需启动：

| 应用 | 路径 | 包名 | 用途 |
| --- | --- | --- | --- |
| admin | `template/mono/apps/admin` | `@madong/admin` | 后台管理端 |
| platform | `template/mono/apps/platform` | `@madong/platform` | 平台管理端 |
| install | `template/mono/apps/install` | `@madong/install` | 图形化安装向导 |
| web | `template/web` | — | 门户网站端 |

> **mono 说明**：admin / platform / install 三个前端都位于 `template/mono/` 这个 pnpm **monorepo**（工作区）下，依赖在 `template/mono` 根目录**一次性安装**，各自用 `pnpm dev -F <包名>`（或进入对应 `apps/*` 目录）启动。`web` 门户端是独立的 Nuxt 应用，单独安装启动。

## 2.3.1 mono（admin / platform / install）

### 安装依赖

在 monorepo 根目录统一安装一次即可覆盖三个应用：

```bash
cd template/mono
pnpm install
```

> `postinstall` 会执行 `pnpm -r run stub`，为工作区内部包生成软链接产物，属正常流程。
> 所有前端都强制使用 **pnpm**（`preinstall` 中执行 `npx only-allow pnpm`）。

### 启动开发服务

三个应用可分别用 `pnpm dev -F <包名>` 启动，也可进入各自 `apps/*` 目录执行 `pnpm dev`：

```bash
# 在 template/mono 根目录
pnpm dev -F @madong/admin       # 后台管理端 → http://localhost:5777
pnpm dev -F @madong/platform    # 平台管理端 → http://localhost:5500
pnpm dev -F @madong/install     # 安装向导   → http://localhost:5888

# 等价：进入应用目录启动
# cd template/mono/apps/admin && pnpm dev
# cd template/mono/apps/platform && pnpm dev
# cd template/mono/apps/install && pnpm dev
```

### 端口速查

| 应用 | 端口 | 接口前缀 | 来源 |
| --- | --- | --- | --- |
| admin | **5777** | `/adminapi` | `apps/admin/.env.development` → `VITE_PORT` |
| platform | **5500** | `/platformapi` | `apps/platform/.env.development` → `VITE_PORT` |
| install | **5888** | `/adminapi` | `apps/install/.env.development` → `VITE_PORT` |

## 2.3.2 admin 后台端

路径：`template/mono/apps/admin`（包名 `@madong/admin`）

### 可用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev -F @madong/admin` | 开发模式（`vite --mode development`） |
| `pnpm build -F @madong/admin` | 生产构建（`--mode production`） |
| `pnpm build:integrated -F @madong/admin` | 一体化部署构建（`--mode integrated`，与后端同域部署） |
| `pnpm build:analyze -F @madong/admin` | 构建产物体积分析 |
| `pnpm preview -F @madong/admin` | 本地预览构建产物 |
| `pnpm typecheck -F @madong/admin` | `vue-tsc` 类型检查 |
| `pnpm lint` / `pnpm format` | 代码检查 / 格式化（mono 根目录执行） |
| `pnpm test:unit` | 单元测试（vitest，mono 根目录执行） |

> 若已进入 `apps/admin` 目录，则直接执行 `pnpm dev` / `pnpm build` / `pnpm typecheck` 等即可，无需 `-F`。

### 开发代理

`vite.config.ts` 中已配置到后端的代理，无需额外处理跨域：

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

**若后端不在 `127.0.0.1:8500`，请修改这里的 `target`。**

### 环境变量

`apps/admin/.env`（公共）：

```ini
VITE_APP_TITLE=MDAdmin-Saas
VITE_APP_NAMESPACE=madong-admin-ele      # 缓存/store 前缀，多项目隔离
VITE_APP_STORE_SECURE_KEY=please-replace-me-with-your-own-key   # store 持久化加密密钥
VITE_APP_ICON_OFFLINE=false              # 是否启用离线图标
```

`apps/admin/.env.development`（开发）：

```ini
VITE_PORT=5777
VITE_BASE=/
VITE_GLOB_API_URL=/adminapi             # 接口前缀

# Webman Push
VITE_GLOB_ENABLE_WSS=true
VITE_GLOB_WSS_URL=ws://127.0.0.1:3501
VITE_GLOB_WSS_APPKEY=60756ede2a9737a05384aad849e220f8

VITE_NITRO_MOCK=true                    # Nitro Mock 服务
VITE_DEVTOOLS=false
VITE_INJECT_APP_LOADING=true
```

`apps/admin/.env.production`（生产）：

```ini
VITE_BASE=/
VITE_GLOB_API_URL=/adminapi
VITE_COMPRESS=none                      # none | brotli | gzip
VITE_PWA=false
VITE_ROUTER_HISTORY=hash                # hash | history
VITE_INJECT_APP_LOADING=true
VITE_ARCHIVER=false                     # 是否生成 dist.zip
```

> 生产环境请务必修改 `VITE_APP_STORE_SECURE_KEY`。

其余环境文件：`.env.integrated`（一体化部署）、`.env.analyze`（体积分析）。

## 2.3.3 platform 平台端

路径：`template/mono/apps/platform`（包名 `@madong/platform`）

平台端用于多租户 SaaS 场景的平台级管理（与 admin 后台端接口前缀不同，走 `/platformapi`）。

### 启动

```bash
cd template/mono
pnpm dev -F @madong/platform
# 或 cd template/mono/apps/platform && pnpm dev
```

默认地址：**http://localhost:5500**（由 `apps/platform/.env.development` 的 `VITE_PORT` 决定）。

### 可用脚本

与 admin 一致的脚本集（`dev` / `build` / `build:integrated` / `build:analyze` / `preview` / `typecheck`），在 mono 根目录加 `-F @madong/platform`，或进入 `apps/platform` 直接执行。

### 开发代理

`vite.config.ts` 中代理到后端的 `/platformapi` 前缀：

```ts
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

## 2.3.4 install 安装端

路径：`template/mono/apps/install`（包名 `@madong/install`）

```bash
cd template/mono
pnpm dev -F @madong/install
# 或 cd template/mono/apps/install && pnpm dev
```

默认地址：**http://localhost:5888**。用于图形化完成数据库初始化，详见 [2.4 安装向导](wizard.md)。

## 2.3.5 web 门户端

路径：`template/web`（Nuxt 独立应用）

```bash
cd template/web
pnpm install
pnpm dev
```

默认地址：**http://localhost:3000**（Nuxt 默认端口）。

### 可用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发模式 |
| `pnpm dev:frontend` | 前台路由模式（`NUXT_PUBLIC_ROUTING_MODE=frontend`） |
| `pnpm dev:backend` | 后台路由模式（`NUXT_PUBLIC_ROUTING_MODE=backend`，路由由后端下发） |
| `pnpm build` | 构建 |
| `pnpm build:frontend` / `pnpm build:backend` | 按路由模式构建 |
| `pnpm build:integrated` | 一体化部署构建 |
| `pnpm generate` | 静态站点生成 |
| `pnpm preview` | 预览 |
| `pnpm start` | 运行构建产物（`node .output/server/index.mjs`） |
| `pnpm lint` / `pnpm lint:fix` | 代码检查 |
| `pnpm typecheck` | 类型检查 |

### 路由模式

web 端支持两种路由来源，通过环境变量 `NUXT_PUBLIC_ROUTING_MODE` 切换：

- `frontend` — 使用本地 `src/pages/` 的文件路由
- `backend` — 从后端接口动态获取页面路由（适合 CMS 场景）

详见 [3.2.3 页面与路由](../frontend/web/pages.md)。

## 2.3.6 常见安装问题

| 现象 | 原因与处理 |
| --- | --- |
| `Use "pnpm install" to install` | 使用了 npm/yarn，改用 pnpm |
| Node 版本报错 | 版本不满足 `^20.19.0 \|\| ^22.18.0 \|\| ^24.x`，升级 Node |
| 依赖下载缓慢 | `pnpm config set registry https://registry.npmmirror.com` |
| mono 下找不到包 | 依赖需在 `template/mono` 根目录执行 `pnpm install`，不要在 `apps/*` 单独装 |
| 接口 404 / 跨域 | 检查后端是否在 `127.0.0.1:8500` 运行，以及 `vite.config.ts` 的 proxy target |
| 构建内存溢出 | `build` 脚本已设置 `--max-old-space-size=8192`，若仍溢出可继续调大 |

> 下一节：[2.4 安装向导](wizard.md)
