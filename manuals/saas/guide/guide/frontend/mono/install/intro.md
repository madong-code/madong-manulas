# Install 应用介绍

## 概述

Install（安装向导前端）是 Madong SaaS 系统的安装向导界面，用于引导用户完成系统安装过程。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **UI 组件**: Element Plus
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router（简单步骤路由）
- **HTTP 客户端**: Axios（自定义封装）
- **SSE**: EventSource（原生）

## 应用特点

### 1. 独立轻量应用

Install 是独立轻量应用，不依赖 `@vben/*` 工作区包，直接使用 ElementPlus + Pinia + Axios。

### 2. 不使用 Vben 框架

与 Admin/Platform 不同，Install 不使用 Vben 框架，直接启动：

```typescript
// apps/install/src/main.ts
async function bootstrap() {
  await initConfig();
  setDocumentTitle();
  const app = createApp(App);
  app.use(ElementPlus);
  app.use(createPinia());
  app.mount('#app');
}
bootstrap();
```

### 3. 6 步安装流程

Install 包含 6 个安装步骤：

1. **agreement-step** - 协议确认
2. **environment-step** - 环境检测
3. **database-step** - 数据库配置
4. **config-step** - 管理员配置
5. **tenant-step** - 多租户配置
6. **complete-step** - 安装完成

### 4. SSE 实时进度

安装执行通过 SSE（Server-Sent Events）实时获取进度：

```typescript
// apps/install/src/store/module/install.ts
function simulateInstallation() {
  const eventSource = new EventSource(sseUrl);
  eventSource.addEventListener('progress', (event) => {
    // Update progress
  });
  eventSource.addEventListener('completed', (event) => {
    // Installation completed
  });
  eventSource.addEventListener('runtime_error', (event) => {
    // Installation failed
  });
}
```

### 5. 选项式 API

Install 的 Store 使用 Pinia 的**选项式 API**（与 Admin/Platform 的 setup 语法不同）：

```typescript
// apps/install/src/store/module/install.ts
export const useInstallStore = defineStore('install', {
  state: () => ({
    agreementData: null,
    environmentData: { check_items: [], directory_check_items: [], passed: false, loading: false },
    databaseConfig: { host: 'localhost', port: 3306, username: 'root', password: 'root', database: 'madong', prefix: 'md_' },
    // ...
  }),
  getters: {
    installDuration: (state) => { /* Calculate install duration */ },
    // ...
  },
  actions: {
    async fetchInstallationStatus() { /* Check if installed */ },
    async simulateInstallation() { /* Start installation */ },
    // ...
  },
});
```

## 与其他应用的关系

Install 与 Admin、Platform 一样，**都位于 `template/mono` 的 monorepo 中**（`apps/install`），共享 mono 的 pnpm workspace：

```
┌─────────────────────────────────────────────────────────┐
│                    Madong SaaS                          │
├─────────────────────────────────────────────────────────┤
│                 template/mono (pnpm workspace)         │
│  ├── Admin      - 后台应用（多租户）                    │
│  ├── Platform   - 平台应用（无多租户）                  │
│  └── Install    - 安装向导（独立轻量）← 当前应用       │
├─────────────────────────────────────────────────────────┤
│  template/web   - 用户端 Web（Nuxt，独立仓库）          │
└─────────────────────────────────────────────────────────┘
```

## 包信息

- **包名**: `@madong/install`
- **版本**: `5.7.0`
- **仓库位置**: `template/mono/apps/install`
- **入口**: `template/mono/apps/install/src/main.ts`
- **代理前缀**: `/adminapi`（安装阶段后端只有 `/adminapi/install` 路由）

## 目录结构

```
template/mono/apps/install/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── App.vue                    # 根组件（包含全部安装步骤逻辑）
│   ├── api/                       # API 层
│   │   └── install.ts            # Install API 函数
│   ├── components/                # 安装步骤组件
│   │   ├── agreement-step/       # 步骤1：协议确认
│   │   ├── environment-step/      # 步骤2：环境检测
│   │   ├── database-step/        # 步骤3：数据库配置
│   │   ├── config-step/          # 步骤4：管理员配置
│   │   ├── tenant-step/          # 步骤5：多租户配置
│   │   └── complete-step/        # 步骤6：安装完成
│   ├── store/                     # 状态管理
│   │   ├── index.ts              # Store 导出
│   │   └── module/
│   │       └── install.ts        # 安装状态（选项式 API）
│   └── utils/
│       └── request.ts            # Axios 请求客户端（单例）
├── package.json
├── .env                          # 环境变量
└── vite.config.ts
```

## 与 Admin/Platform 的关键差异

| 维度 | admin/platform | install |
|------|---------------|---------|
| 框架 | Vben Admin 5 | 直接 ElementPlus |
| 启动 | initPreferences + bootstrap | createApp + ElementPlus |
| 依赖 | @vben/* 全家桶 | 仅 vue + element-plus + pinia + axios |
| 路由 | 后端菜单驱动 | 简单步骤路由 |
| 布局 | Vben Layout 系统 | 单页面无布局 |
| Store API 风格 | setup 语法（`() => {}`） | **选项式 API**（state/getters/actions） |
| SSE | request.ts 的 `sse()` 函数 | **原生 EventSource** |
| 数据 | 业务数据 | 安装配置 + 进度 |

## 下一步

- [6步安装流程详解](./steps.md) - 了解安装流程的每一步
- [Admin 应用介绍](../admin/intro.md) - 了解 Admin 应用
- [Platform 应用介绍](../platform/intro.md) - 了解 Platform 应用
