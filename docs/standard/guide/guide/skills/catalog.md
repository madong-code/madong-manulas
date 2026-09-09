# 技能目录

`skills/` 按「后端 / 前端 / 跨层」三大领域组织，每个主题是一个含 `SKILL.md` 的目录。

## 后端（backend/）

| 技能 | 作用 |
| --- | --- |
| `backend/command` | 自定义命令行（Symfony Console + `#[AsCommand]`） |
| `backend/config` | 配置体系与注入约定 |
| `backend/controller` | 控制器 + OpenAPI 注解路由 |
| `backend/core` | 框架核心（只读，不可改）约定说明 |
| `backend/dao` | 数据访问层写法 |
| `backend/enum` | PHP 枚举使用 |
| `backend/event` | 事件定义与派发 |
| `backend/generator` | 全栈代码生成器（基于表结构产出四层 + 前端） |
| `backend/listener` | 事件监听器 |
| `backend/middleware` | 中间件（鉴权/权限/日志） |
| `backend/model` | Eloquent 模型 |
| `backend/plugin` | 应用插件开发（运行时在 `backend/plugin/`） |
| `backend/route` | 路由与权限码注解 |
| `backend/schema` | DTO / OpenAPI Schema |
| `backend/service` | 服务层 |
| `backend/validate` | 验证器与场景 |

## 前端（frontend/）

| 技能 | 作用 |
| --- | --- |
| `frontend/admin` | Vben Admin（Vue 3 + Element Plus）后台 |
| `frontend/web` | Nuxt 4 前端 |
| `frontend/install` | 安装向导 |
| `frontend/shared` | 前后端共享约定（API 契约、i18n） |
| `frontend/ARCHITECTURE.md` | 前端架构总览 |

## 主题（theme/）

UI 主题相关技能（如 `theme/madong-vue`、`theme/ant-design`）。

## 跨编辑器同步

`skills/README.md` 定义了分发机制：通过 `skills/sync.ps1`（Windows）或 `skills/sync.sh`（macOS/Linux）把技能同步到各编辑器目录（`.codebuddy/skills`、`.cursor/rules`、`.trae`、`.github` 等）。
