# Admin 项目结构详解

## 整体结构

```
apps/admin/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── bootstrap.ts               # 启动引导
│   ├── preferences.ts             # 偏好配置
│   ├── app.vue                    # 根组件
│   ├── api/                       # API 层
│   │   ├── request.ts             # requestClient 实例 + SSE 封装
│   │   ├── index.ts               # 聚合导出
│   │   ├── auth/                 # 认证 API
│   │   ├── core/                 # 核心 API（refreshToken）
│   │   └── {module}/             # 业务模块 API
│   │       ├── index.ts           # API 函数
│   │       └── types.ts          # 请求/响应类型定义
│   ├── components/                # 组件
│   │   ├── crud/                 # CRUD 组件
│   │   ├── dialog/               # 通用弹窗
│   │   ├── form/                 # 表单组件
│   │   ├── render/               # 渲染组件
│   │   ├── icon/                 # 图标组件
│   │   ├── page/                 # 页面组件
│   │   ├── tenant-switch/         # 租户切换（Admin 特有）
│   │   ├── terminal/             # Web 终端（Admin 特有）
│   │   └── utils/                # SSE 工具（Admin 特有）
│   ├── router/                    # 路由
│   │   ├── index.ts               # Router 实例创建
│   │   ├── access.ts             # 权限路由生成（后端菜单模式）
│   │   ├── guard.ts              # 路由守卫
│   │   ├── routes/               # 路由定义
│   │   │   ├── index.ts          # 路由聚合
│   │   │   ├── core.ts           # 核心路由（Root/Auth/404）
│   │   │   ├── backend.ts        # 后端模式路由（Profile）
│   │   │   └── modules/          # 业务模块路由
│   │   └── plugin/               # 插件路由
│   │       ├── index.ts           # 插件路由管理器
│   │       └── scanner.ts        # 插件路由扫描器
│   ├── store/                     # 状态管理
│   │   ├── index.ts               # Store 导出
│   │   ├── auth.ts               # 认证状态（含多租户切换）
│   │   └── modules/              # 功能模块 Store
│   │       ├── dict.ts            # 字典缓存
│   │       ├── notify.ts          # 消息通知（WebSocket Push）
│   │       └── site-config.ts     # 系统配置
│   ├── views/                     # 页面
│   │   ├── system/               # 系统管理
│   │   ├── member/               # 会员管理
│   │   ├── goods/                # 商品管理
│   │   ├── order/                # 订单管理
│   │   ├── marketing/            # 营销管理
│   │   ├── finance/              # 财务管理
│   │   ├── content/              # 内容管理
│   │   ├── plugin/               # 插件管理
│   │   ├── tools/                # 工具管理
│   │   └── dashboard/            # 仪表盘
│   ├── adapter/                   # 适配器
│   │   ├── form.ts                # VbenForm 适配器
│   │   ├── vxe-table.ts          # VxeTable 表格适配器
│   │   ├── component/            # 组件适配器
│   │   └── crud/                 # CRUD 组件导出
│   ├── lang/                      # 业务国际化
│   │   ├── zh-CN/                # 中文
│   │   └── en-US/                # 英文
│   └── locales/                   # 框架国际化
│       ├── index.ts               # 国际化配置初始化
│       ├── loader/                # 加载器
│       └── langs/                 # 内置语言包
│           ├── zh-CN/
│           └── en-US/
├── package.json
├── .env                          # 环境变量
├── .env.example                  # 环境变量示例
├── vite.config.ts                # Vite 配置
└── tsconfig.json                 # TypeScript 配置
```

## 核心目录说明

### api/ - API 层

API 层使用 `@vben/request` 的 `RequestClient`，封装了请求拦截、响应拦截、SSE 等功能。

```
api/
├── request.ts                    # requestClient 实例
├── index.ts                      # 聚合导出
├── auth/                         # 认证 API
│   ├── index.ts                  # 登录、登出、刷新令牌
│   └── types.ts                 # 认证类型定义
├── core/                         # 核心 API
│   └── refresh-token.ts         # 刷新令牌
├── system/                       # 系统管理 API
│   ├── index.ts                  # API 函数
│   └── types.ts                  # 类型定义
├── member/                       # 会员管理 API
├── goods/                        # 商品管理 API
├── order/                        # 订单管理 API
├── marketing/                    # 营销管理 API
├── finance/                      # 财务管理 API
├── content/                      # 内容管理 API
├── plugin/                       # 插件管理 API
└── tools/                        # 工具管理 API
```

**特点**：
- 多租户 `X-Tenant-Id` 头注入
- 支持 SSE 实时通信
- 统一的错误处理

### components/ - 组件

```
components/
├── crud/                         # CRUD 组件
│   ├── crud.vue                  # 主组件
│   ├── types.ts                  # 类型定义
│   ├── use-crud.ts              # CRUD hooks
│   └── components/              # 子组件
├── dialog/                       # 通用弹窗
├── form/                         # 表单组件
├── render/                       # 渲染组件
├── icon/                         # 图标组件
├── page/                         # 页面组件
├── tenant-switch/                 # 租户切换（Admin 特有）
├── terminal/                     # Web 终端（Admin 特有）
└── utils/                        # SSE 工具（Admin 特有）
```

**特点**：
- 与 Platform 共享基础组件
- Admin 特有 `tenant-switch`、`terminal`、`utils/sse` 组件

### router/ - 路由

```
router/
├── index.ts                      # Router 实例
├── access.ts                     # 权限路由生成
├── guard.ts                      # 路由守卫
├── routes/
│   ├── index.ts                  # 路由聚合
│   ├── core.ts                   # 核心路由
│   ├── backend.ts                # 后端模式路由
│   └── modules/                 # 业务模块路由
│       ├── system.ts
│       ├── member.ts
│       ├── goods.ts
│       ├── order.ts
│       ├── marketing.ts
│       ├── finance.ts
│       ├── content.ts
│       ├── plugin.ts
│       └── tools.ts
└── plugin/                       # 插件路由
    ├── index.ts
    └── scanner.ts
```

**特点**：
- 后端菜单驱动模式
- 路由 code 命名：`Admin{Module}{Action}`
- 插件路由动态扫描

### store/ - 状态管理

```
store/
├── index.ts                      # Store 导出
├── auth.ts                       # 认证状态（含多租户切换）
└── modules/
    ├── dict.ts                   # 字典缓存
    ├── notify.ts                 # 消息通知（WebSocket Push）
    └── site-config.ts            # 系统配置
```

**特点**：
- 使用 Pinia 的 setup 语法
- 含多租户切换逻辑（`fetchTenantList` / `switchTenant`）
- 含消息通知 Store（WebSocket Push）

### views/ - 页面

```
views/
├── system/                       # 系统管理
│   └── menu/
│       ├── index.vue              # 页面主文件
│       └── schemas.ts            # CRUD Schema 定义
├── member/                       # 会员管理
├── goods/                        # 商品管理
├── order/                        # 订单管理
├── marketing/                    # 营销管理
├── finance/                      # 财务管理
├── content/                      # 内容管理
├── plugin/                       # 插件管理
├── tools/                        # 工具管理
└── dashboard/                    # 仪表盘
```

**特点**：
- 所有 CRUD 页面使用 `BasicCrud + formDialog + schemas` 模式
- 组件名前缀：`Admin`

## 与 Platform 的结构差异

| 目录 | Admin | Platform |
|------|-------|----------|
| `store/auth.ts` | 含多租户切换 | 无多租户逻辑 |
| `store/modules/notify.ts` | 有（WebSocket Push） | 无 |
| `components/tenant-switch/` | 有 | 无 |
| `components/terminal/` | 有 | 无 |
| `components/utils/sse/` | 有 | 无 |
| `api/request.ts` | 注入 `X-Tenant-Id` | 不注入 |
| 业务模块数量 | 10 个 | 6 个 |

## src/ 详细目录列表

```
src/
├── adapter/                   # 适配器
├── api/                       # API 层
├── assets/                    # 静态资源
├── components/                # 组件
├── composables/               # 组合式函数
├── layouts/                   # 布局
├── locales/                   # 框架国际化
├── router/                    # 路由
├── store/                     # 状态管理
├── styles/                    # 样式
├── utils/                     # 工具函数
├── views/                     # 页面
├── lang/                      # 业务国际化
├── main.ts                    # 应用入口
├── bootstrap.ts               # 启动引导
├── preferences.ts             # 偏好配置
└── app.vue                    # 根组件
```

## 下一步

- [系统配置](./config.md) - 配置环境变量
- [主题配置](./theme.md) - 配置主题
- [路由和菜单](./route-menu.md) - 了解路由配置
