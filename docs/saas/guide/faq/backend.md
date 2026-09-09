# 后端常见问题

**Q1：改了代码没生效？**
A：后端是常驻内存应用，修改业务代码后必须重启：`php start.php restart`（Linux）或重启 `windows.php`（Windows）。开发期可开启 `monitor` 自动重载。

**Q2：接口返回 404？**
A：检查路由是否用 `#[OA\Get/Post(...)]` 注解声明；确认类上有 `#[Middleware(AccessTokenMiddleware::class, ...)]` 且位于 `app/adminapi/controller` 下。插件接口必须放在 `backend/plugin/` 运行时目录，否则扫描不到。

**Q3：端口被占用 / 想改端口？**
A：改 `backend/config/process.php` 中的 `listen`（`http://0.0.0.0:8500`），然后重启。

**Q4：JWT 鉴权失败 401？**
A：确认请求带正确 token（Authorization 头）；登录接口需 `#[AllowAnonymous]`。令牌过期用 refreshToken 刷新。

**Q5：权限 403？**
A：接口声明的 `#[Permission(code: ...)]` 未分配给当前用户角色。超级管理员会短路放行。前端按钮需与后端权限码一致。

**Q6：数据库连接报错？**
A：检查 `.env` 的 `DB_*` 与 `config/database.php`；改 `.env` 后需重启（配置常驻内存）。

**Q7：软删除数据还在表内？**
A：这是预期行为。`delete` 只写 `deleted_at`，回收站相关接口在 `Crud` 基类的 `recycleList/recycleRestore/recycleDestroy`。

**Q8：能否在 Controller 直接写 SQL？**
A：不推荐。遵循四层架构：查询放 Dao，业务放 Service，Controller 只做参数与响应。

**Q9：Eloquent 和 think-orm？**
A：本仓库使用 **Laravel Illuminate Database ^11.33**，不是 think-orm。

**Q10：`unique` 校验更新时校验自身？**
A：在 Validate 的 `update` 场景里把 `unique:Model,code` 改为 `unique:Model,code,{id},id` 排除当前记录（参考 `PostValidate::Update()`）。
