# 快速开始

## 环境要求

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 18.0.0 | 推荐使用 LTS 版本 |
| pnpm | ≥ 8.0.0 | 包管理器 |
| Git | ≥ 2.0 | 版本控制 |

## 获取代码

```bash
# 方式一：从 git 仓库克隆（如果已独立发布）
git clone <仓库地址>
cd template/web

# 方式二：在 Madong-Saas 项目中
cd template/web
```

## 安装依赖

```bash
pnpm install
```

> ⚠️ 本项目配置了 `preinstall` 钩子，强制使用 pnpm，使用 npm 或 yarn 安装会报错。

## 环境变量

复制环境变量模板：

```bash
# 开发环境
cp .env.development .env.development.local

# 生产环境
cp .env.production .env.production.local
```

编辑 `.env.development.local`，修改后端 API 地址：

```ini
# .env.development
NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8500/api
NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY=pc
NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY=Authorization
NUXT_PUBLIC_DEFAULT_LANG=zh-CN
NUXT_PUBLIC_X_TENANT_ID=
```

| 变量名 | 说明 | 默认值 |
|---------|------|--------|
| `NUXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | `/api` |
| `NUXT_PUBLIC_REQUEST_HEADER_CHANNEL_KEY` | 请求头渠道标识 | `pc` |
| `NUXT_PUBLIC_REQUEST_HEADER_TOKEN_KEY` | Token 请求头 Key | `Authorization` |
| `NUXT_PUBLIC_DEFAULT_LANG` | 默认语言 | `zh-CN` |
| `NUXT_PUBLIC_X_TENANT_ID` | 默认租户 ID |（空，自动从 store 读取） |

## 启动开发服务器

```bash
pnpm run dev
```

启动后访问：[http://localhost:3000/web](http://localhost:3000/web)

## 构建生产版本

```bash
# 构建
pnpm run build

# 预览构建结果
pnpm run preview

# 直接启动（需要先 build）
pnpm run start
```

## 生成静态站点

```bash
pnpm run generate
```

## 代码质量检查

```bash
# ESLint 检查
pnpm run lint

# ESLint 自动修复
pnpm run lint:fix
```

## 常见问题

### 1. pnpm install 报错 "Only pnpm is allowed"

这是 `preinstall` 钩子的作用，确保团队统一使用 pnpm。如果你确实在使用 pnpm 但仍然报错，检查：

```bash
# 确认 pnpm 版本
pnpm -v

# 如果没有安装 pnpm
npm install -g pnpm
```

### 2. 开发服务器代理不生效

检查 `nuxt.config.ts` 中的 `vite.server.proxy` 配置，确保后端地址正确：

```ts
// nuxt.config.ts
vite: {
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8500",  // 确认后端已启动
        changeOrigin: true,
      },
    },
  },
}
```

### 3. 端口被占用

Nuxt 默认使用 3000 端口，被占用时会自动切换。也可以手动指定：

```bash
# 修改 package.json 中的 dev 脚本
"dev": "nuxi dev --port 3001"
```
