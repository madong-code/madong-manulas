# 前端部署

## 后台前端（admin，Vben）

构建为静态站，由 Nginx 托管（或放到 `backend/public/admin` 由 Webman 直接服务）。

```bash
cd template/mono/apps/admin
pnpm build           # 产物在 dist/
```

> admin / platform / install 都在 `template/mono/` monorepo 下，依赖在 mono 根目录 `pnpm install` 一次性安装。

部署要点：

- 产物 `dist/` 拷贝到 Web 服务器根目录（或 `backend/public/admin`）。
- SPA 需配置 `try_files $uri $uri/ /index.html` 兜底路由（见 `build/deploy/nginx.conf`）。
- `base` 路径若为子目录，构建前在 `.env` 设置 `VITE_BASE`（如 `/admin/`）。

## 前台前端（web，Nuxt）

Nuxt 当前 `ssr: false`，按静态站构建（也可保持 SSR 模式由 Node 托管）。

```bash
cd template/web
pnpm install
pnpm build           # 产物 .output/
```

- **静态模式（当前默认）**：将 `.output/public` 交给 Nginx 托管。
- **SSR 模式**：`node .output/server/index.mjs` 由 Node 托管（需 Supervisor 守护，见 supervisor）。

## 平台端（platform）

```bash
cd template/mono/apps/platform
pnpm build           # 产物 dist/
```

放到 `backend/public/platform`，由 Nginx 托管或 Webman 直接服务。

## 安装向导（install）

```bash
cd template/mono/apps/install
pnpm build           # 产物 dist/
```

放到 `backend/public/install`，通过浏览器访问 `/install` 走安装流程（6 步 + SSE 进度），完成后生成 `install.lock`。

## 代理配置

前端 dev/生产都通过代理把 `/adminapi`、`/api` 转发到后端 `8500`：

- 开发：`template/mono/apps/admin` 的 Vite 代理、`template/web` 的 `vite.server.proxy`。
- 生产：Nginx `proxy_pass http://127.0.0.1:8500`（见[Nginx 反代](nginx.md)）。
