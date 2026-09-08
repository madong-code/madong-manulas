# 项目结构

## 根目录结构

```
template/web/
├── src/                  # 主应用源码（Nuxt 4 srcDir 模式）
├── public/               # 公共静态资源（直接复制到输出根目录）
├── .output/              # 构建输出目录（nuxt build 生成）
├── .nuxt/               # Nuxt 开发缓存（nuxt dev 生成）
├── node_modules/         # 依赖包
├── .env                  # 环境变量（全环境生效）
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── nuxt.config.ts        # Nuxt 核心配置文件
├── tsconfig.json         # TypeScript 配置
├── uno.config.ts         # UnoCSS 配置
├── package.json          # 项目依赖和脚本
├── pnpm-lock.yaml       # pnpm 锁文件
├── eslint.config.mjs     # ESLint 配置
└── Dockerfile           # Docker 部署配置
```

## src/ 目录结构

```
src/
├── api/                  # API 接口定义（按模块分组）
│   ├── auth/            # 认证相关接口（登录、注册、刷新 Token）
│   │   ├── index.ts     # 接口方法
│   │   └── types.ts    # 请求/响应类型定义
│   ├── member/          # 会员相关接口
│   ├── system/          # 系统相关接口
│   └── site/           # 站点相关接口
│
├── assets/              # 静态资源（会被 Vite 处理）
│   ├── css/            # 样式重置
│   ├── scss/           # 全局 SCSS 样式
│   │   ├── element/    # Element Plus 主题定制
│   │   ├── app.scss    # 应用样式
│   │   ├── dark.scss   # 深色模式样式
│   │   ├── index.scss  # 样式入口
│   │   ├── mixins.scss # SCSS 混入
│   │   └── var.scss    # SCSS 变量
│   ├── icons/          # SVG 图标
│   └── images/         # 图片资源
│
├── components/          # 公共 Vue 组件
│   ├── advertisement/   # 广告组件
│   ├── icon/           # 图标组件（Iconify + 本地图标）
│   ├── login-dialog/    # 登录对话框（登录/注册/忘记密码）
│   ├── search-box/      # 搜索框
│   ├── seo/            # SEO 元数据组件
│   └── sms-code/      # 短信验证码组件
│
├── composables/         # 组合式函数（类似 React Hooks）
│   ├── auth.ts          # 认证相关逻辑
│   ├── captcha.ts      # 验证码逻辑
│   ├── lang.ts         # 语言切换逻辑
│   ├── login.ts        # 登录弹窗逻辑
│   └── send-sms.ts    # 发送短信逻辑
│
├── lang/                # 国际化语言文件
│   ├── en/             # 英文
│   │   ├── common.json
│   │   ├── auth/login.json
│   │   └── member/...
│   └── zh-cn/         # 中文
│       ├── common.json
│       ├── auth/login.json
│       └── member/...
│
├── layouts/             # 页面布局组件
│   ├── default.vue      # 默认布局（带页头、页脚、侧边栏）
│   ├── blank.vue       # 空白布局（无页头页脚）
│   ├── container.vue   # 容器布局
│   ├── member.vue      # 会员中心布局
│   └── components/     # 布局子组件
│       ├── header.vue
│       ├── footer.vue
│       ├── aside.vue
│       ├── menu.vue
│       ├── dark-switch.vue
│       └── ...
│
├── middleware/          # Nuxt 中间件（路由守卫）
│   ├── auth.ts         # 认证守卫（需要登录的页面）
│   └── global.ts      # 全局守卫
│
├── pages/              # 页面组件（自动生成路由）
│   ├── index.vue       # 首页（/web）
│   ├── member/         # 会员中心页面
│   │   ├── profile.vue # 个人资料
│   │   └── components/ # 会员中心子组件
│   └── routes.ts      # 手动路由定义（补充文件系统路由）
│
├── plugin/             # 插件目录（预留，用于模块扩展）
│   └── .gitkeep
│
├── plugins/            # Nuxt 插件（自动执行）
│   ├── auth-init.ts   # 认证初始化
│   ├── element.plus.ts # Element Plus 全局配置
│   ├── i18n.ts        # 国际化插件
│   ├── icon.ts         # 图标注册
│   ├── permission.ts  # 权限控制
│   └── pinia-persist.ts # Pinia 持久化配置
│
├── stores/             # Pinia 状态管理
│   ├── app.ts          # 应用状态（全局）
│   ├── config.ts       # 配置状态
│   ├── globals.ts     # 全局共享状态
│   ├── member.ts      # 会员状态（登录信息、Token）
│   ├── system.ts       # 系统状态（站点配置、租户）
│   ├── constant/      # 常量定义
│   └── interface/    # TypeScript 接口定义
│
├── types/              # TypeScript 类型定义
│   ├── global.d.ts    # 全局类型声明
│   ├── composables.d.ts # 组合式函数类型
│   ├── member.ts      # 会员相关类型
│   └── permission.d.ts # 权限相关类型
│
├── utils/              # 工具函数
│   ├── request.ts     # HTTP 请求封装（核心）
│   ├── common.ts      # 通用工具
│   ├── dark.ts        # 深色模式工具
│   ├── icon-utils.ts # 图标工具
│   ├── router.ts      # 路由工具
│   ├── storage.ts     # 存储工具
│   ├── url.ts         # URL 处理工具
│   └── validate.ts    # 表单验证规则
│
├── app.vue             # 根组件
└── router.options.ts   # Vue Router 配置（自定义路由）
```

## 关键文件说明

### nuxt.config.ts

Nuxt 核心配置文件，定义模块、运行时配置、Vite 代理等。详见[配置体系](config.md)。

### src/router.options.ts

自定义 Vue Router 配置，用于：

1. **加载 `pages/routes.ts`** 的手动路由定义
2. **动态加载插件路由**（`~/plugin/**/pages/routes.ts`）
3. **为插件路由添加 `addon` meta 标识**

### src/utils/request.ts

HTTP 请求核心封装类 `Http`，基于原生 `fetch` API，功能包括：

- 请求/响应拦截器
- 自动注入 Token（`Authorization` 请求头）
- 自动注入渠道标识（`pc` / `h5` 等）
- 自动注入租户 ID（`X-Tenant-Id`）
- Token 过期自动刷新（401 处理）
- 支持文件上传（`upload` 方法）
- 支持多种响应类型（`json` / `blob` / `text`）
- 超时处理（默认 30 秒，上传 60 秒）

### src/stores/member.ts

会员状态 Store，管理：

- 登录态（`isLogin`）
- 用户信息（`userInfo`）
- Access Token 和 Refresh Token
- 登录 / 登出方法
- Token 持久化（Pinia 持久化插件 + Cookie）

## 与 mono（管理后台）的结构差异

| 对比项 | mono（管理后台） | web（用户端） |
|--------|-------------------|----------------|
| 框架 | Vite + Vue 3（Vben Admin） | Nuxt 4（SSR / SSG） |
| 入口 | `apps/admin/src/main.ts` | `src/app.vue` |
| 路由 | 手动配置（`router` 目录） | 文件系统自动生成 + `routes.ts` |
| 布局 | Vben Admin Layout | Nuxt Layout（`layouts/` 目录） |
| API 层 | `packages/@madong/api-client` | `src/api/` |
| 状态管理 | Pinia（`stores/` 目录） | Pinia（`stores/` 目录） |
| 样式 | CSS Modules + Less | SCSS + UnoCSS |
| 构建输出 | 纯静态 SPA（`dist/`） | Nitro 引擎（`.output/`，支持 SSR） |
