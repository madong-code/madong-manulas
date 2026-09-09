# 构建与部署

## 概述

`template/web` 基于 **Nuxt 4**（Nitro 引擎），支持多种部署方式：

| 部署方式 | 说明 | 适用场景 |
|-----------|------|----------|
| Node.js 服务器 | 使用 Nitro 的 Node 预设 | 生产环境（推荐） |
| 静态站点 | 预渲染为纯静态文件 | CDN 部署、GitHub Pages |
| Docker | 使用 Dockerfile 构建镜像 | 容器化部署 |
| Serverless | Nitro 支持多种 Serverless 平台 | Vercel、Netlify 等 |

## 构建命令

```bash
# 开发模式（热更新）
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产构建（本地测试）
pnpm run preview

# 直接启动生产服务器（需要先 build）
pnpm run start

# 生成静态站点（预渲染）
pnpm run generate
```

## Node.js 部署（推荐）

### 构建

```bash
cd template/web
pnpm run build
```

构建产物在 `.output/` 目录：

```
.output/
├── server/
│   └── index.mjs       # 生产服务器入口
├── public/              # 静态资源
└── nitro.json          # Nitro 配置
```

### 启动

```bash
# 方式一：使用 pnpm 脚本
pnpm run start

# 方式二：直接运行
node .output/server/index.mjs
```

默认监听 `http://localhost:3000`。

### 环境变量

生产环境下，在 `.env.production` 中配置：

```ini
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NUXT_PUBLIC_DEFAULT_LANG=zh-CN
```

### PM2 进程管理（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start .output/server/index.mjs --name madong-web

# 查看日志
pm2 logs madong-web

# 重启
pm2 restart madong-web

# 开机自启
pm2 startup
pm2 save
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name web.yourdomain.com;

    location /web {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 静态站点部署

### 构建静态文件

```bash
pnpm run generate
```

静态文件在 `.output/public/` 目录，可以部署到任何静态文件服务器。

### 部署到 CDN

```bash
# 构建
pnpm run generate

# 上传 .output/public/ 到 CDN
# 或使用 CLI 工具（如 aliyun-cli、aws-cli）
```

### GitHub Pages

```bash
# 构建
pnpm run generate

# 将 .output/public/ 推送到 gh-pages 分支
```

> ⚠️ 静态站点模式下，API 请求需要配置正确的后端地址（跨域处理）。

## Docker 部署

### Dockerfile

项目已提供 `Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY .output /app/.output
COPY package.json /app/

RUN npm install --production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

### 构建镜像

```bash
# 先构建
pnpm run build

# 构建 Docker 镜像
docker build -t madong-web:latest .

# 运行容器
docker run -d -p 3000:3000 \
  -e NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api \
  --name madong-web \
  madong-web:latest
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_API_BASE_URL=http://backend:8500/api
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    # 后端服务（参考 backend 部署文档）
    image: madong-backend:latest
    ports:
      - "8500:8500"
```

启动：

```bash
docker-compose up -d
```

## 环境变量配置

### 开发环境（.env.development）

```ini
NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8500/api
NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY=pc
NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY=Authorization
NUXT_PUBLIC_DEFAULT_LANG=zh-CN
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

> 📌 生产环境下，如果使用 Docker 部署，建议通过 `docker run -e` 或 `docker-compose` 的 `environment` 注入环境变量，而非写死在 `.env.production` 中。

## 性能优化

### 开启 Gzip 压缩（Nginx）

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 开启 Brotli 压缩（Nginx）

```nginx
brotli on;
brotli_comp_level 6;
```

### 静态资源 CDN

在 `nuxt.config.ts` 中配置 CDN 地址：

```ts
export default defineNuxtConfig({
  app: {
    cdnURL: 'https://cdn.yourdomain.com',
  },
})
```

## 常见问题

### 1. 构建时报错 "Cannot find module"

```bash
# 删除依赖重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 2. 生产环境下 API 请求跨域

Nuxt 在生产环境下**不会**使用 Vite 代理，需要确保：

- 后端已配置 CORS 允许前端域名
- 或者前端通过 Nginx 反向代理统一域名

### 3. 静态站点下动态路由 404

使用 `pnpm run generate` 时，动态路由（如 `/member/profile`）需要显式配置：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/member/profile', '/member/settings'],
    },
  },
})
```

### 4. 内存占用过高

Nuxt 4 的 Nitro 引擎默认会使用较多内存，可以通过环境变量限制：

```bash
# 限制 Node.js 内存为 1GB
NODE_OPTIONS="--max-old-space-size=1024" pnpm run start
```
