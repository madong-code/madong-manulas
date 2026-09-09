# 开发工作流

推荐以「后端四层 + 前端 CRUD」为单位的端到端开发流程。

## 标准流程

1. **建表**：在 `backend/resource/database/migrations/` 新增 Phinx 迁移，定义表结构（字段、索引、前缀 `md_`）。执行 `php start.php migrate`。
2. **生成骨架**：用脚手架命令生成 Controller/Service/Dao/Model/Validate（见[代码生成](codegen.md)），或手动按四层创建。
3. **写后端**：在 Controller 用注解声明路由与权限码，Service 写业务，Dao 写查询，Model 维护字段白名单与关联。
4. **写前端**：在 `template/mono/apps/admin` 用 `CrudSchema` + `useCrud` 生成列表/表单页，挂到菜单路由。
5. **联调**：启动后端（`php start.php start`）+ 前端 dev server，浏览器联调。
6. **同步文档/技能**：如需让 AI 遵循新规范，更新 `skills/` 并重新同步。

## 本地联调

- 后端监听 `8500`，前端 dev server 代理 `/adminapi`、`/api` 到 `8500`（见 `template/mono/apps/admin/.env` 与 Vite 配置）。
- 改动后端代码后**必须重启**后端进程（`php start.php restart`），常驻内存不会热更业务类。
- 前端改动由 Vite HMR 即时生效，无需重启。

## 调试技巧

- 接口报错看 `backend/runtime/log/` 与终端输出（调试模式单进程）。
- SQL 调试：临时在 Dao 调用 `->toSql()`，或用 `DB::enableQueryLog()`。
- SSE/WebSocket：打开浏览器 Network 的 EventStream 看实时流。

## 不要碰的边界

- `backend/core/`：框架核心，禁止修改。
- `frontend/packages/`、`frontend/scripts/`、`frontend/internal/`：受保护目录。
- 改后端契约（响应字段、权限码）会同时影响所有前端，**禁止为某个 UI 单独改契约**。
