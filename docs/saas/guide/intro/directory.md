# 1.4 目录结构

```
madong/
├── backend/                      # 后端项目（webman 2.x）
│   ├── .env                    # 环境变量配置（安装时复制 .env.example）
│   ├── app/                   # 应用目录
│   │   ├── adminapi/         # Admin API 控制器
│   │   ├── api/              # 前台 API 控制器
│   │   ├── platform/         # Platform API 控制器
│   │   ├── service/          # 服务层
│   │   ├── dao/              # 数据访问层
│   │   ├── model/            # 模型层
│   │   ├── validate/         # 验证层
│   │   ├── schema/           # DTO Schema
│   │   └── plugin/           # 插件目录
│   ├── config/               # 配置文件（28个）
│   ├── database/             # 数据库迁移
│   ├── route/                # 路由配置
│   ├── public/               # 公开目录
│   └── start.php             # 入口文件
├── template/                    # 前端模板（Monorepo）
│   ├── mono/                 # Monorepo 根目录
│   │   ├── apps/
│   │   │   ├── admin/        # 后台管理前端
│   │   │   ├── platform/     # 平台管理前端
│   │   │   ├── install/      # 安装向导前端
│   │   │   └── backend-mock/ # 后端 Mock 服务
│   │   ├── packages/         # 共享包
│   │   │   ├── @core/        # 核心包
│   │   │   ├── @madong/      # Madong 业务包
│   │   │   └── vben-components/ # Vben 组件包
│   │   └── pnpm-workspace.yaml
│   └── web/                  # Nuxt 用户端 Web
├── skills/                      # 开发规范（69个 SKILL.md）
│   ├── backend/               # 后端规范（25个）
│   ├── frontend/              # 前端规范（按应用分）
│   └── cross/                # 跨层规范（5个）
└── docs/                        # 项目文档（当前所在）
```

> **说明**：`docs/` 目录为内部文档，由 Docsify 渲染为左侧导航的站点。

## 下一步

- [1.5 核心特征](features.md)