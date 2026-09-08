# 安装向导（Install）分册

`install/` 是系统 **首次部署时的安装向导** 前端，技术栈为轻量 **Vite + Vue 3 + Element Plus + Pinia**，独立于后台管理与门户。

---

## 1. 技术栈

| 项 | 说明 |
| ---- | ---- |
| 构建 | Vite（`vite@^8`） |
| 框架 | Vue 3 + vue-router@5 + Pinia@3 |
| UI | Element Plus（含 `@element-plus/icons-vue`） |
| 请求 | axios |
| 自动导入 | `unplugin-auto-import` + `unplugin-vue-components`（Components.d.ts / auto-imports.d.ts 已生成） |
| 包管理 | pnpm（`engines` 要求 node ≥ 20.19 / 22.18 / 24） |

---

## 2. 目录结构

```text
install/
├── src/
│   ├── api/          # 安装接口（环境检测、数据库连接、管理员创建）
│   ├── assets/       # 静态资源
│   ├── components/   # 向导步骤组件
│   ├── router/       # 路由
│   ├── store/        # Pinia（安装状态）
│   ├── types/        # TS 类型
│   ├── utils/        # 工具
│   ├── App.vue
│   ├── main.ts
│   ├── auto-imports.d.ts
│   └── components.d.ts
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## 3. 构建模式

```bash
pnpm dev                 # 开发（--mode development）
pnpm build               # 生产构建（--mode production）
pnpm build:integrated    # 一体化构建（--mode integrated，产物交由 Webman 托管）
```

- `build:integrated` 与 `web` 的 integrated 模式一致，最终静态产物由后端安装路由托管。

---

## 4. 安装流程

典型步骤（详见 [flow.md](./flow.md)）：

1. 环境检测（PHP 版本、扩展、目录权限）
2. 数据库配置（host / port / db / user / password）
3. Redis 配置
4. 管理员账号创建
5. 执行迁移与初始化数据
6. 完成，跳转后台登录

---

## 5. 与后端的关系

安装向导调用的接口属于后端 `install` 应用（多应用之一，见 [`backend/architecture/multi-app.md`](../../backend/architecture/multi-app.md)），路径前缀通常为 `/install`。安装完成后该应用可禁用。
