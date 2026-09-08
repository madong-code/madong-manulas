# 后端 · 架构总览

后端采用 **四层架构 + 内核/业务分离 + 多应用 + 多租户** 的清晰结构，目标是在常驻内存（Webman）环境下保持可维护性与可扩展性。

---

## 1. 四层架构

```text
HTTP 请求
   │
   ▼
Controller (app/adminapi/controller)   ← 仅做「接收请求 / 调 Service / 出 JSON」
   │  依赖注入 Service
   ▼
Service   (app/service)                ← 业务逻辑编排、事务、领域规则
   │  依赖注入 Dao
   ▼
Dao       (app/dao)                    ← 数据查询封装（条件构造、分页、树）
   │  操作 Model
   ▼
Model     (app/model)                  ← 表映射、字段类型 $casts、关联
   │
   ▼
MySQL / Redis
```

**原则**：
- Controller **不含业务**，只调用 Service 并返回 `Json::success/fail`。
- Service **不含 SQL**（交由 Dao），负责事务与编排。
- Dao **不跨表写业务**，只封装查询。
- Model **只映射表与字段类型**，不放复杂逻辑。

---

## 2. 内核 / 业务分离

| 目录 | 是否可改 | 内容 |
| ---- | ---- | ---- |
| `core/` | **不可改** | 框架内核：BaseController/Crud、BaseService/BaseDao/BaseModel、JWT、异常、工具 |
| `app/` | 可改 | 全部业务实现，继承 `core` 基类 |

> 升级内核时直接覆盖 `core/`，业务代码不受影响。详见各基础类说明。

---

## 3. 多应用（Multi-App）

`adminapi` / `api` / `install` 三套独立应用，路径前缀隔离，共用 `service`/`dao`/`model`。详见 [multi-app.md](./multi-app.md)。

---

## 4. 多租户（Multi-Tenant）

- **scope（行级）**：`app/scope/global/` 提供 `AccessPermissionScope` 等，自动为查询追加数据权限条件（如部门范围）。
- **global（全局）**：跨租户共享数据走独立连接或标记。
- 详见 [modules/tenant.md](./tenant.md)。

---

## 5. 依赖注入容器

PHP-DI 自动装配，构造函数类型声明即注入。详见 [container.md](./container.md)。

---

## 6. 请求生命周期

见 [lifecycle.md](./lifecycle.md)：从 Nginx → Webman worker → 中间件栈 → 路由分发 → Controller → Service → Dao → 响应。
