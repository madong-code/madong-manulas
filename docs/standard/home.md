# Madong 极速开发框架文档

madong 极速开发框架 是一套基于 **Webman (PHP) + Vue 3 (TypeScript)** 的前后端分离中后台开发框架，后端以插件化 + 分层架构支撑业务快速迭代。


## 资源与图片约定

- **静态图片**：统一放在 `assets/img/` 目录（即 `docs/assets/img/`），按板块分子目录（如 `assets/img/frontend/`），避免散落在各文档目录。
- **文档引用**（在 `guide/` 下的 `.md` 中用相对路径）：
  ```md
  ![说明](../assets/img/frontend/login-flow.png)
  ```
  跨板块、跨层级引用都不会出错。
- **`assets/libs/`**：存放 Docsify 运行时依赖（JS/CSS/Prism 语言包），由站点自动加载，**不要手动编辑**。
- 站点基于 [Docsify](https://docsify.js.org/) 构建，文档即 `.md` 源文件，无需打包；部署时将 `docs/` 整目录放到静态服务器（Nginx 等）即可。

---

## 一、文档导航

| 序号 | 板块 | 说明 | 入口 |
| --- | --- | --- | --- |
| — | 使用文档 | 本地预览、部署、新增文档、图片约定 | [使用文档](./guide/usage.md) |
| 01 | 项目介绍 | 项目定位、技术栈、整体架构、目录总览 | [进入](./guide/intro/index.md) |
| 02 | 快速开始 | 环境准备、后端启动、前端启动、初始化安装 | [进入](./guide/quickstart/index.md) |
| 03 | 前端文档 | 通用规范 + 各套 UI 分册 + 门户端 + 安装端 | [进入](./guide/frontend/index.md) |
| 04 | 后端文档 | 架构分层、基础用法、业务模块、进阶能力 | [进入](./guide/backend/index.md) |
| 05 | 插件开发 | 插件机制、前后端插件、代码生成器 | [进入](./guide/plugin/index.md) |
| 06 | 开发规范 | 编码规范、Git 规范、接口规范、安全规范 | [进入](./guide/dev-guide/index.md) |
| 07 | 部署运维 | 生产部署、Nginx、进程守护、性能优化 | [进入](./guide/deploy/index.md) |
| 08 | 常见问题 | FAQ、错误码、排错手册 | [进入](./guide/faq/index.md) |
| 99 | 更新日志 | 版本记录与升级指引 | [进入](./guide/changelog/index.md) |

---

## 二、按角色推荐阅读路径

### 新成员（第一天）

1. [项目介绍 → 技术栈](./guide/intro/tech-stack.md)
2. [项目介绍 → 整体架构](./guide/intro/architecture.md)
3. [快速开始 → 环境准备](./guide/quickstart/environment.md)
4. [快速开始 → 启动项目](./guide/quickstart/index.md)

### 前端开发

1. [前端 → 总览](./guide/frontend/index.md)
2. [前端 → 通用规范](./guide/frontend/common/index.md)（**必读**，与 UI 库无关）
3. [前端 → Element Plus 分册](./guide/frontend/admin-ele/index.md)（当前主线）
4. [插件开发 → 前端插件](./guide/plugin/frontend-plugin.md)

### 后端开发

1. [后端 → 总览](./guide/backend/index.md)
2. [后端 → 架构分层](./guide/backend/architecture/layers.md)
3. [后端 → 基础用法](./guide/backend/basic/controller.md)
4. [插件开发 → 后端插件](./guide/plugin/backend-plugin.md)

### 运维部署

1. [部署 → 生产部署](./guide/deploy/production.md)
2. [部署 → Nginx 配置](./guide/deploy/nginx.md)
3. [部署 → 进程守护](./guide/deploy/supervisor.md)

---

## 三、多套后台 UI 说明（重要）

MDAdmin 的后台前端设计为「**内核复用 + UI 分套**」：业务逻辑、请求层、权限、路由、插件机制全部沉淀在通用层，UI 组件通过 `src/adapter/` 适配层接入，因此可以并行维护多套 UI 皮肤。

文档对应地采用**完整分套**结构，每套 UI 拥有独立的完整文档树：

| 分册 | UI 库 | 状态 | 文档 |
| --- | --- | --- | --- |
| `admin-ele` | Element Plus | ✅ 已实现（当前主线） | [进入](./guide/frontend/admin-ele/index.md) |
| `admin-antd` | Ant Design Vue | 🚧 预留（骨架已建） | [进入](./guide/frontend/admin-antd/index.md) |
| `admin-naive` | Naive UI | 🚧 预留（骨架已建） | [进入](./guide/frontend/admin-naive/index.md) |

> 三套分册的**章节结构完全一致**，便于横向对照与迁移。与 UI 无关的共性内容统一收敛到 [`common/`](./guide/frontend/common/index.md)，各分册只描述该 UI 的差异实现，避免重复维护。
>
> 新增一套 UI 时，请复制 `admin-antd/` 骨架并按 [新增一套 UI 指南](./guide/frontend/common/add-new-ui.md) 逐节填充。

---

## 四、文档目录结构

文档站按「文档 / 配置 / 资源」三分组织，位于 `docs/` 下：

```
docs/
├── index.html                   # 站点入口（Docsify 配置 + 本地依赖引用）
├── README.md                    # 首页（文档总入口）
├── _sidebar.md                 # 左侧导航（Markdown 缩进表示层级）
├── _navbar.md                  # 顶部导航栏
├── _coverpage.md                # 封面页
├── guide/                       # 文档区（所有 .md 源）
│   ├── usage.md                 # 站点使用说明（本地预览/部署/维护）
│   ├── intro/                   # 项目介绍
│   ├── quickstart/              # 快速开始
│   ├── frontend/                # ── 前端 ──
│   │   ├── common/              # 通用规范（与 UI 库无关，必读）
│   │   ├── admin-ele/           # 后台 · Element Plus 分册
│   │   ├── admin-antd/          # 后台 · Ant Design Vue 分册（预留）
│   │   ├── admin-naive/         # 后台 · Naive UI 分册（预留）
│   │   ├── web/                 # 前台门户端
│   │   └── install/             # 安装引导端
│   ├── backend/                 # ── 后端 ──
│   │   ├── getting-started/     # 入门
│   │   ├── architecture/        # 架构设计
│   │   ├── basic/               # 基础用法
│   │   ├── modules/             # 业务模块
│   │   └── advanced/            # 进阶能力
│   ├── plugin/                  # 插件开发
│   ├── dev-guide/               # 开发规范
│   ├── deploy/                  # 部署运维
│   ├── faq/                     # 常见问题
│   └── changelog/               # 更新日志
└── assets/                      # 资源区
    ├── libs/                    # Docsify 运行时依赖，勿手动编辑
    ├── img/                     # 静态图片，按板块分子目录
    ├── custom.css               # 自定义样式
    └── libs/                    # JS/CSS 依赖
```

---

## 五、文档维护约定

1. **一节一文件**：每个 Markdown 聚焦一个主题，避免超长文档。
2. **代码即文档**：示例代码必须来自真实可运行的项目代码，不臆造 API。
3. **改代码同步改文档**：涉及目录结构、配置项、接口约定的改动，需同步更新对应章节。
4. **新增文件登记导航**：新增 `.md` 后同步在 `_sidebar.md` 中添加链接，否则不会出现在导航中。
5. **UI 差异下沉**：共性内容写进 `common/`，只有该 UI 特有的写进对应分册。
6. **图片归资源区**：图片统一放 `assets/img/`，文档中用 `../assets/img/...` 引用。
