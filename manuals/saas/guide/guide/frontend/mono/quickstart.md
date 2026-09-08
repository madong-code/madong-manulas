# Mono 快速开始

本文介绍如何在 `template/mono` 下快速搭建开发环境，一次性启动 / 构建 admin、platform、install 三个应用。

## 环境要求

| 工具 | 版本要求 | 说明 |
| --- | --- | --- |
| Node.js | `^20.19.0 \|\| ^22.18.0 \|\| ^24.0.0` | JavaScript 运行时 |
| pnpm | `>= 10.0.0` | 包管理器（**必须**，项目强制 pnpm） |
| Git | 最新 | 版本控制 |

## 安装依赖

依赖在 mono 根目录**一次性安装**，覆盖三个应用与全部共享包：

```bash
cd template/mono
pnpm install
```

> ⚠️ **必须使用 pnpm**。根 `package.json` 的 `preinstall` 执行 `npx only-allow pnpm`，使用 npm/yarn 会直接报错退出。
> `postinstall` 会执行 `pnpm -r run stub`，为工作区内部包生成软链接产物，属正常流程。

安装慢时切换镜像：

```bash
pnpm config set registry https://registry.npmmirror.com
pnpm install
```

## 启动应用

```bash
# 启动所有应用（turbo 按依赖图并发）
pnpm dev

# 启动指定应用
pnpm -F @madong/admin dev        # 后台端 → http://localhost:5777
pnpm -F @madong/platform dev     # 平台端 → http://localhost:5500
pnpm -F @madong/install dev      # 安装向导 → http://localhost:5888

# 或进入应用目录启动
# cd apps/admin && pnpm dev
```

> 端口由各应用 `.env.development` 的 `VITE_PORT` 决定，详见 [Mono 共享配置](./config.md)。

## 构建应用

```bash
# 构建所有应用（turbo）
pnpm build

# 构建指定应用
pnpm -F @madong/admin build

# 一体化构建（产物输出到 backend/public/{admin,platform,install}，与后端同域部署）
pnpm -F @madong/admin build:integrated
```

> 标准 `build` 产物输出到 `apps/{app}/dist/`；`build:integrated` 输出到 `backend/public/{app}/`。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动所有应用（turbo 并发） |
| `pnpm build` | 构建所有应用 |
| `pnpm preview` | 预览构建产物 |
| `pnpm lint` | 代码检查（`vsh lint`） |
| `pnpm format` | 格式化（`vsh lint --format`） |
| `pnpm typecheck` | 类型检查（`turbo run typecheck`） |
| `pnpm check` | 类型检查 + lint + 依赖检查 |
| `pnpm test:unit` | 单元测试（Vitest） |
| `pnpm commit` | 规范化提交（czg 交互式） |
| `pnpm clean` | 清理构建产物 |

## 预览构建产物

```bash
pnpm -F @madong/admin preview
```

## 常见问题

**Q：`ERR_PNPM_UNSUPPORTED_ENGINE`**
A：Node 版本不符合 `^20.19.0 || ^22.18.0 || ^24.0.0`，升级 Node 或用 fnm/nvm 切换。

**Q：执行 `npm install` 立即报错**
A：项目强制 pnpm，改用 `pnpm install`。

**Q：端口被占用**
A：修改对应应用 `.env.development` 的 `VITE_PORT`，或结束占用进程。

**Q：依赖安装失败**
A：尝试清理缓存后重装：

```bash
pnpm clean
pnpm install
```

## 下一步

- [项目结构详解](./structure.md) — mono 目录与共享包
- [共享配置](./config.md) — 环境变量、代理、构建
- [Admin 应用开发](./admin/intro.md)
- [Platform 应用开发](./platform/intro.md)
