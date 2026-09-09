# Admin 快速开始

## 环境要求

- **Node.js**: >= 20 LTS
- **pnpm**: >= 9
- **Git**: 最新版本

## 安装依赖

在 `template/mono` 仓库根目录执行（mono 为 pnpm workspace）：

```bash
# 安装整个 mono 仓库依赖
cd template/mono
pnpm install

# 或仅安装 admin 应用依赖
pnpm --filter @madong/admin install
```

## 启动开发服务器

```bash
# 方式一：进入应用目录直接启动
cd template/mono/apps/admin
pnpm dev

# 方式二：从 mono 根目录按包名启动
cd template/mono
pnpm --filter @madong/admin dev

# 方式三：使用 turbo 运行
pnpm turbo dev --filter=@madong/admin
```

开发服务器默认运行在 `http://localhost:5777`（由 `.env.development` 中的 `VITE_PORT` 决定）。

## 环境变量配置

复制环境变量示例文件：

```bash
cp template/mono/apps/admin/.env.development.example template/mono/apps/admin/.env.development
```

编辑 `.env.development` 文件，配置必要的环境变量（详见 [系统配置](./config.md)）。

## 构建生产版本

```bash
# 进入应用目录构建（集成构建输出到 backend/public/admin）
cd template/mono/apps/admin
pnpm build:integrated

# 或标准构建（输出到 dist/）
pnpm build
```

构建产物默认输出到 `template/mono/apps/admin/dist/` 目录；`build:integrated` 模式输出到 `backend/public/admin/`。

## 预览生产版本

```bash
cd template/mono/apps/admin
pnpm preview
```

## 项目脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本（输出 dist/） |
| `pnpm build:integrated` | 集成构建（输出到 backend/public/admin） |
| `pnpm preview` | 预览生产版本 |
| `pnpm typecheck` | TypeScript 类型检查 |

## 多租户开发

### 1. 获取租户列表

登录后，调用 `authStore.fetchTenantList()` 获取租户列表。

### 2. 切换租户

调用 `authStore.switchTenant(tenantId)` 切换租户。

切换后：
- 更新 Token
- 重新加载用户信息
- 重新加载权限码
- 重置路由

### 3. X-Tenant-Id 头

Admin 的 `request.ts` 在请求拦截器中自动注入 `X-Tenant-Id` 头：

```typescript
// template/mono/apps/admin/src/api/request.ts
client.addRequestInterceptor({
  fulfilled: async (config) => {
    config.headers.Authorization = formatToken(accessStore.accessToken);
    config.headers['Accept-Language'] = preferences.app.locale;

    // Multi-tenant: inject tenant ID
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

## 常见问题

### 1. 端口被占用

修改 `.env.development` 中的 `VITE_PORT` 配置项：

```env
VITE_PORT=5778
```

### 2. API 代理失败

检查 `.env` 中的 `VITE_GLOB_API_URL` 配置：

```env
VITE_GLOB_API_URL=/adminapi
```

确保后端服务已启动，并且代理配置正确。

### 3. 多租户头未注入

检查：
- 是否已登录
- `accessStore.tenantId` 是否有值
- 请求 URL 是否不在排除列表中

### 4. 依赖安装失败

尝试清理缓存后重新安装：

```bash
pnpm clean
pnpm install
```

## 下一步

- [项目结构](./structure.md) - 了解项目目录结构
- [路由和菜单](./route-menu.md) - 配置路由和菜单
- [基础组件](../components/overview.md) - 开发自定义组件
