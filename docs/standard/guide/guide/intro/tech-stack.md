# 1.2 技术栈

以下清单全部取自仓库内真实的 `composer.json` / `package.json` / `nuxt.config.ts`。

## 1.2.1 后端（`backend/`）

### 运行时与框架

| 依赖 | 版本 | 作用 |
| --- | --- | --- |
| `php` | `>=8.2` | 运行时 |
| `workerman/workerman` | `~5.1` | 底层事件驱动网络库 |
| `workerman/webman-framework` | `~2.2` | Web 框架内核 |
| `webman/console` | `^2.2` | 命令行（`php webman xxx`） |
| `webman/event` | `^1.0` | 事件系统 |
| `workerman/crontab` | `^1.0` | 定时任务 |

### 数据与缓存

| 依赖 | 版本 | 作用 |
| --- | --- | --- |
| `illuminate/database` | `^11.33` | ORM（Eloquent），非 think-orm |
| `illuminate/pagination` | `^11.33` | 分页 |
| `illuminate/events` | `^11.46` | Eloquent 模型事件依赖 |
| `webman/database` | `~2.1` | Webman 的数据库桥接 |
| `webman/redis` / `webman/cache` | `~2.1` | Redis 与缓存 |
| `webman/redis-queue` | `^2.1` | Redis 队列 |
| `robmorgan/phinx` | `^0.16.10` | 数据库迁移 |
| `webman-tech/symfony-lock` | `^2.0` | 分布式锁 |

### 认证、鉴权与校验

| 依赖 | 版本 | 作用 |
| --- | --- | --- |
| `firebase/php-jwt` | `^6.10` | JWT 签发与校验 |
| `casbin/casbin` | `^4.0` | RBAC 权限模型 |
| `topthink/think-validate` | `^2.0` | 验证器 |
| `webman/validation` | `^2.2` | 验证集成 |
| `webman/captcha` | `^1.0` | 图形验证码 |
| `webman/limiter` | `^2.2` | 限流 |

### 接口文档与查询

| 依赖 | 版本 | 作用 |
| --- | --- | --- |
| `webman-tech/swagger` | `^2.1` | OpenAPI 注解扫描 |
| `madong/swagger` | `^2.0` | 项目定制的注解与路由派生 |
| `madong/query` | `^1.0` | **查询构造器**（前端查询参数 → SQL） |
| `madong/helper` | `^1.1` | 通用辅助函数 |

### 基础设施与三方能力

| 依赖 | 作用 |
| --- | --- |
| `php-di/php-di` `^7.0` | 依赖注入容器 |
| `symfony/translation` `^7.2` + `webman-tech/laravel-translation` `^11.0` | 国际化 |
| `monolog/monolog` + `webman/log` | 日志 |
| `webman/push` `^1.0` | **消息推送（WebSocket）** |
| `phpseclib/phpseclib` `^3.0` | **SSH，Web 终端底座** |
| `aliyuncs/oss-sdk-php`、`qcloud/cos-sdk-v5`、`qiniu/php-sdk`、`league/flysystem-aws-s3-v3` | 对象存储 |
| `overtrue/easy-sms`、`phpmailer/phpmailer` | 短信、邮件 |
| `phpoffice/phpspreadsheet` `^4.2` | Excel 导入导出 |
| `jenssegers/agent` | UA 解析 |
| `topthink/think-template` `^3.0` | 模板引擎（代码生成器使用） |
| `ramsey/uuid`、`erusev/parsedown`、`vlucas/phpdotenv` | UUID / Markdown / 环境变量 |

### 自动加载约定

```json
"autoload": {
    "psr-4": {
        "app\\": "./app",
        "core\\": "./core"
    },
    "psr-0": { "": "extend" },
    "files": ["./support/helpers.php"]
}
```

> `app\` 为业务代码，`core\` 为框架内核层，`support/helpers.php` 提供全局辅助函数。

## 1.2.2 后台端（`template/admin/`）

基于 **Vben Admin 5.7 (Element Plus 版)** 的 pnpm monorepo。

| 分类 | 依赖 |
| --- | --- |
| 核心 | `vue` 3、`vue-router`、`pinia` + `pinia-plugin-persistedstate` |
| UI | `element-plus`、`@element-plus/icons-vue`、`reka-ui` |
| 表格 | `vxe-table`、`vxe-pc-ui` |
| 表单校验 | `vee-validate` + `@vee-validate/zod` + `zod` |
| 请求 | `axios` |
| 国际化 | `vue-i18n`、`@intlify/core-base` |
| 图表 | `echarts` |
| 富文本 | `@tiptap/*`、`@wangeditor/editor` |
| 样式 | `tailwindcss` + `sass`、`class-variance-authority`、`tailwind-merge` |
| 图标 | `@iconify/vue`、`lucide-vue-next` |
| 工具 | `dayjs`、`es-toolkit`、`qs`、`json-bigint`、`secure-ls`、`sortablejs`、`nprogress` |
| 构建 | `vite`、`@vitejs/plugin-vue(-jsx)`、`rolldown`、`vite-plugin-compression`、`vite-plugin-pwa` |
| 质量 | `oxlint`、`oxfmt`、`vue-tsc`、`vitest`、`lefthook` |

依赖版本统一由 pnpm **catalog** 管理（`package.json` 中大量 `"catalog:"`），版本号集中在工作区 `pnpm-workspace.yaml`。

## 1.2.3 门户端（`template/web/`）

| 分类 | 依赖 / 配置 |
| --- | --- |
| 框架 | **Nuxt 4**（`future.compatibilityVersion: 4`，`srcDir: 'src'`） |
| 渲染 | `ssr: false`（当前为 SPA 模式，可按需开启） |
| UI | `@element-plus/nuxt`（`importStyle: 'scss'`，支持 `dark` 主题） |
| 样式 | `@unocss/nuxt` + SCSS |
| 状态 | `@pinia/nuxt` + `pinia-plugin-persistedstate/nuxt` |
| 工具 | `@vueuse/nuxt`（开启 `ssrHandlers`） |
| 图标 | `nuxt-icons` |
| 富文本 | `@wangeditor/editor`、`@wangeditor/editor-for-vue` |
| 规范 | `@nuxt/eslint` |

## 1.2.4 安装端（`template/install/`）

Vue 3 + Vite 的独立小应用，用于图形化完成环境检测、数据库配置与初始化建表。

> 下一节：[1.3 整体架构](architecture.md)
