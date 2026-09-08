# 架构概览

## 请求生命周期

```
浏览器 / 前端
   │  HTTP  (http://0.0.0.0:8500/adminapi/...)
   ▼
Webman Worker（常驻内存）
   │
   ├─ 路由匹配：OpenAPI 注解扫描注册（app/adminapi、app/install、app/schema）
   ▼
Middleware（中间件链）
   │  AccessTokenMiddleware → PermissionMiddleware → OperationMiddleware
   ▼
Controller（控制器：参数接收、权限注解、响应封装）
   ▼
Service（服务层：业务逻辑编排）
   ▼
Dao（数据访问：查询构造、分页、软删除）
   ▼
Model（模型：表映射、字段、关联、类型转换）
   ▼
MySQL + Redis
```

## 分层原则

| 层 | 职责 | 允许依赖 |
| --- | --- | --- |
| Controller | 接收请求、校验入参、调用 Service、封装响应 | Service、Validate、Middleware |
| Service | 业务编排、事务、调用 Dao | Dao、其他 Service、事件 |
| Dao | 数据读写、查询构造、分页 | Model |
| Model | 表结构、字段白名单、关联、类型转换 | 无（仅 Eloquent） |

> **严格向下依赖**：上层可调用下层，下层绝不可反向依赖上层。例如 `PostController` 调用 `PostService`，`PostService` 注入 `PostDao`，`PostDao` 指向 `Post` 模型。

## 核心基类

| 类 | 位置 | 作用 |
| --- | --- | --- |
| `core\foundation\base\Base` | `core/foundation/base/Base.php` | Controller 基类，提供响应工具 |
| `core\foundation\base\BaseService` | `core/foundation/base/BaseService.php` | Service 基类，持有 `dao` 属性 |
| `core\foundation\base\BaseDao` | `core/foundation/base/BaseDao.php` | Dao 基类，提供查询构造与分页 |
| `core\foundation\base\BaseModel` | `core/foundation/base/BaseModel.php` | Model 基类（继承 Eloquent） |
| `core\foundation\base\BaseValidate` | `core/foundation/base/BaseValidate.php` | 验证器基类（场景校验） |
| `app\adminapi\controller\Crud` | `app/adminapi/controller/Crud.php` | 通用 CRUD 控制器，含增删改查/回收站/导入导出 |

## 应用模块

- `app/adminapi`：后台管理接口（前缀 `/adminapi`）
- `app/api`：前台/移动端开放接口（前缀 `/api`）
- `app/install`：安装向导接口（前缀 `/install`）
- `app/plugin`：插件运行时（由 Webman 启动扫描 `backend/plugin/` 注册）
- `core`：框架核心（不可改）
- `command`：自定义命令行（含 `make:controller`、`make:service` 等代码生成）
