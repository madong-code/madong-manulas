# 1.5 核心特性

## 1.5.1 常驻内存的多进程服务

后端基于 Workerman/Webman，进程在 `backend/config/process.php` 中编排，典型包含：

- **HTTP 进程** — 处理常规接口请求
- **监控进程 (monitor)** — 开发期文件变更热重载
- **队列消费进程** — 消费 Redis 队列任务
- **定时任务进程** — `madong-scheduler`（`core.infrastructure.scheduler`，监听 127.0.0.1:2001）驱动
- **推送进程** — `webman/push` 的 WebSocket 服务

框架与容器只在进程启动时加载一次，请求间复用，性能远高于 PHP-FPM 模式。

## 1.5.2 严格四层分层

`Controller → Service → Dao → Model`，依赖只能向下。基类位于 `core/foundation/base/`，提供统一的 CRUD 骨架与响应封装，业务类只需覆写差异部分。详见 [4.2 基础功能](../backend/basic/index.md)。

## 1.5.3 注解驱动路由与接口文档

接口路由由 **OpenAPI 注解**（`webman-tech/swagger` + `madong/swagger`）扫描派生，无需在 `route.php` 中逐条登记；同一份注解同时产出在线接口文档，实现"文档即代码"。详见 [4.1.4 模块结构](../backend/getting-started/structure.md)。

## 1.5.4 通用 CRUD 控制器

继承 `app/adminapi/controller/Crud` 即自动获得列表、详情、新增、修改、删除、批量删除等标准动作，配合 Service/Dao 基类，新建一个业务模块通常只需少量代码。

## 1.5.5 查询构造器

`madong/query` 将前端传来的结构化查询参数（字段、操作符、值、排序、分页）安全地翻译为 SQL 条件，避免在 Dao 中堆砌大量 `if` 判断。详见 [4.3.3 查询构造器](../backend/advanced/query.md)。

## 1.5.6 RBAC 权限

使用 **Casbin** 实现基于角色的访问控制，配合中间件在请求入口完成鉴权；前端通过权限码控制菜单、按钮的可见性与可用性。详见 [4.2.7 权限管理](../backend/basic/permission.md) 与 [3.1.5 权限控制](../frontend/admin/access.md)。

## 1.5.7 多租户

请求链路内置租户上下文（`X-Tenant-Id`），数据层可按租户自动隔离，适配 SaaS 交付场景。

## 1.5.8 国际化

- 后端：`symfony/translation` + `webman-tech/laravel-translation`，配置见 `config/translation.php`，通过语言中间件识别请求语言。
- 前端：`vue-i18n`，语言包位于 `src/locales/`，支持按需加载与运行时切换。

详见 [4.1.7 国际化](../backend/getting-started/i18n.md) 与 [3.1.9 国际化](../frontend/admin/i18n.md)。

## 1.5.9 应用插件机制

后端 `backend/plugin/` 与前端 `template/admin/src/plugin/` 各自支持插件目录：

- 放入目录即被扫描注册，删除目录即卸载
- 插件可携带自己的路由、控制器、模型、菜单与前端页面
- 核心代码零侵入

详见 [4.3.2 应用插件](../backend/advanced/plugin.md)。

## 1.5.10 Web 终端

内核 `core/business/terminal/` 基于 `phpseclib` 提供 SSH 能力，配置见 `config/terminal.php`，前端通过 WebSocket 获得浏览器内的交互式终端，可用于服务器运维。详见 [4.3.1 Web 终端](../backend/advanced/terminal.md)。

## 1.5.11 消息推送

`webman/push` 提供 WebSocket 推送通道，`core/communication/notify/` 负责通知编排，支持站内信、实时提醒等场景。详见 [4.3.4 消息推送](../backend/advanced/push.md)。

## 1.5.12 内容审核

`core/interface/review/` 对接内容审核能力，配置见 `config/review.php`，用于文本/图片的合规校验。详见 [4.3.5 内容审核](../backend/advanced/review.md)。

## 1.5.13 丰富的基础设施

| 能力 | 实现 |
| --- | --- |
| 文件上传与对象存储 | `core/io/upload`，支持本地 / 阿里云 OSS / 腾讯云 COS / 七牛 / S3 |
| Excel 导入导出 | `core/io/excel`（PhpSpreadsheet） |
| 短信 / 邮件 | `core/communication/sms`、`email` |
| 缓存 / 日志 / 监控 / 调度 | `core/infrastructure/` |
| JWT / 验证码 | `core/security/` |
| 数据库迁移 | Phinx（`phinx.php` + `resource/`） |
| 分布式锁 / 限流 | `webman-tech/symfony-lock`、`webman/limiter` |

## 1.5.14 AI 友好

`skills/` 目录以结构化 Markdown 描述项目分层约定、命名规范与代码模板，可直接被 AI 编码助手加载，使生成的代码天然符合项目风格。详见 [6. Skills](../skills/index.md)。

> 下一章：[2. 安装指南](../install/index.md)
