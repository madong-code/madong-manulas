# 前端常见问题

**Q1：admin 页面空白 / 路由不显示？**
A：确认 `useCrud(useCrudSchema())` 已注册，菜单已在后台录入，路由 `meta` 的 `permission` 与后端 `#[Permission]` 一致。

**Q2：请求 404 / CORS？**
A：开发期确认 Vite 代理把 `/adminapi`、`/api` 指向后端 8500；生产期确认 Nginx 反代（见[部署 - Nginx](deploy/nginx.md)）。

**Q3：接口字段对不上？**
A：前端与后端共用契约（字段名、权限码）。禁止为单个 UI 改后端契约；字段变更需同步前后端。

**Q4：i18n 文案不生效？**
A：确认 `src/locales` 下对应语言文件存在且键名正确；插件文案用 `$t('plugin.name.key')`，键名与插件语言包一致。

**Q5：web（Nuxt）页面打不开？**
A：确认 `ROUTING_MODE`（frontend/backend/hybrid）配置正确，且与 `pages/` 目录结构匹配；SSR 模式需 Node 进程运行。

**Q6：构建报内存溢出？**
A：admin 构建设 `NODE_OPTIONS=--max-old-space-size=8192`（参考 Dockerfile）；web 同理。

**Q7：如何换 UI 主题？**
A：`template/mono/apps/admin` 是固定位置、可整体换为不同 UI 模版（靠 `package.json` 的 `name` 区分，如 `vue-vben-admin-ele` / `madong-vue`）。换模版时后端契约不变，只需保证新模版调用相同 API。

**Q8：受保护目录不能改？**
A：是的。mono 下 `packages/`、`scripts/`、`internal/` 及依赖定义文件为受保护目录，业务代码改 `apps/`（如 `template/mono/apps/admin/src/views` 等）。
