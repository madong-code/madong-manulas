# 技能目录

`skills/` 按「后端 / 前端 / 跨层」三大领域组织，每个主题是一个含 `SKILL.md` 的目录。路径前缀统一为 `skills/`。

## 后端规范（skills/backend/）

| 技能 | 作用 |
| --- | --- |
| `backend/controller` | 控制器规范（AdminAPI / Platform / API 继承 Crud 或 Base） |
| `backend/service` | 服务层规范（继承 BaseService，注入 DAO） |
| `backend/dao` | 数据访问层规范（继承 BaseDao，setModel） |
| `backend/model` | Eloquent 模型规范（雪花 ID / 软删除 / 多租户 Scope） |
| `backend/validate` | 验证器规范（继承 BaseValidate） |
| `backend/schema` | Schema DTO 规范（请求 / 响应 DTO，OpenAPI 注解） |
| `backend/enum` | 枚举规范（实现 IEnum 接口） |
| `backend/event` | 事件规范（继承 BaseEvent） |
| `backend/listener` | 监听器规范（继承 BaseListener） |
| `backend/route` | 路由规范（Swagger 注解自动注册） |
| `backend/config` | 配置体系规范（28 个配置文件约定） |
| `backend/bootstrap` | 启动引导规范（CoreConfig / MorphMap / ValidationRules） |
| `backend/lang` | 后端国际化规范（PHP 嵌套数组结构） |
| `backend/logger` | 日志规范（8 级日志 + 操作日志 + 异常日志） |
| `backend/middleware` | 中间件规范（全局 / AdminAPI / Platform 三层） |
| `backend/scope` | 数据权限作用域规范（TenantScope / DataPermissionScope） |
| `backend/queue` | Redis 队列消费者规范（继承 BaseQueueConsumer） |
| `backend/process` | 自定义进程规范（基于 Workerman） |
| `backend/command` | 命令行命令规范（基于 Symfony Console） |
| `backend/crontab` | 定时任务规范（基于 scheduler 调度器） |
| `backend/swagger` | Swagger / OpenAPI 注解规范 |
| `backend/exception` | 异常体系规范（15 种异常类 + Handler + Logger） |
| `backend/tests` | 后端测试规范（PHPUnit） |

## 代码生成（skills/backend/gen/）

| 技能 | 作用 |
| --- | --- |
| `backend/gen/generator` | 代码生成器规范（Gen 命令 + Stub 模板） |
| `backend/gen/parse` | 表解析规范（识别表结构） |
| `backend/gen/migrate` | 数据库迁移规范（表结构 / 字段 / 索引） |
| `backend/gen/crud` | CRUD 全流程生成（migration→model→controller→…→前端） |
| `backend/gen/controller` | 控制器代码生成 |
| `backend/gen/service` | 服务代码生成 |
| `backend/gen/dao` | DAO 代码生成 |
| `backend/gen/model` | 模型代码生成 |
| `backend/gen/validate` | 验证器代码生成 |
| `backend/gen/schema` | Schema 代码生成 |
| `backend/gen/api-controller` | 前台 API 控制器生成 |
| `backend/gen/api-service` | 前台 API 服务生成 |
| `backend/gen/event` | 事件生成 |
| `backend/gen/listener` | 监听器生成 |
| `backend/gen/route` | 路由配置生成 |
| `backend/gen/migration` | 迁移文件生成 |
| `backend/gen/parse-table` | 表解析生成 |
| `backend/gen/i18n-backend` | 后端国际化生成 |
| `backend/gen/frontend` | 前端页面生成 |
| `backend/gen/i18n-frontend` | 前端国际化生成 |

## 前端（skills/frontend/）

### shared（前后端共享，admin/platform 一致）

| 技能 | 作用 |
| --- | --- |
| `frontend/shared/adapter` | Vben 应用（admin/platform）CRUD / vxe-table / 组件映射 |
| `frontend/shared/component` | 共享公共组件规范（CRUD / FormDialog / 渲染组件） |
| `frontend/shared/i18n` | 共享国际化规范（JSON 结构 + 加载器） |

### admin（后台应用，`template/mono/apps/admin`）

| 技能 | 作用 |
| --- | --- |
| `frontend/admin/api` | API 层规范（requestClient + SSE + 多租户 X-Tenant-Id） |
| `frontend/admin/bootstrap` | 启动引导规范（Vben 模式 + @madong/admin） |
| `frontend/admin/component` | Admin 特有组件（tenant-switch / terminal） |
| `frontend/admin/router` | 路由规范（后端菜单驱动 + 插件路由扫描） |
| `frontend/admin/store` | 状态管理规范（auth 多租户 + notify WebSocket + dict） |
| `frontend/admin/view` | 视图层规范（CRUD 页面 + schemas + 10 个业务模块） |
| `frontend/admin/tests` | 测试规范（Vitest + Vue Test Utils） |

### platform（平台应用，`template/mono/apps/platform`）

| 技能 | 作用 |
| --- | --- |
| `frontend/platform/api` | API 层规范（requestClient + SSE，无多租户头） |
| `frontend/platform/bootstrap` | 启动引导规范（Vben 模式 + @madong/platform） |
| `frontend/platform/component` | Platform 特有组件（notification-drawer） |
| `frontend/platform/router` | 路由规范（后端菜单驱动 + 插件路由扫描） |
| `frontend/platform/store` | 状态管理规范（auth 无多租户 + dict + site-config） |
| `frontend/platform/view` | 视图层规范（CRUD 页面 + schemas + 6 个业务模块） |
| `frontend/platform/tests` | 测试规范（Vitest + Vue Test Utils） |

### install（安装向导，`template/mono/apps/install`）

| 技能 | 作用 |
| --- | --- |
| `frontend/install/api` | API 层规范（axios 请求客户端） |
| `frontend/install/bootstrap` | 启动引导规范（直接 createApp + ElementPlus + Pinia） |
| `frontend/install/component` | 安装步骤组件（6 步骤） |
| `frontend/install/store` | 状态管理规范（useInstallStore，选项式 API + SSE） |

## 跨层（skills/cross/）

| 技能 | 作用 |
| --- | --- |
| `cross/api-convention` | 前后端 API 对接规范（响应格式 / 错误码 / 查询操作符 / 分页） |
| `cross/database` | 数据库设计规范（表前缀 / 字段 / 索引 / 隔离） |
| `cross/app-skeleton` | 新增前端站点脚手架规范 |
| `cross/git-convention` | Git 提交规范（lefthook + commitlint + czg + 分支命名） |
| `cross/commit-convention` | 多仓库提交信息格式（backend / template / apps scope 用法） |
| `cross/lint-format` | Lint / Format 工具链规范（oxfmt + oxlint + eslint + stylelint） |
