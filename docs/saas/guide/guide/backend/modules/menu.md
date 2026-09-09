# 后端 · 菜单

菜单既驱动前端侧边栏，也承载权限入口。

---

## 1. 菜单结构

- 表：`mic_system_menu`（树形，`pid` 父子）。
- 字段：名称、图标、路由 path、组件、排序、权限码（`authority`）、是否隐藏。

---

## 2. 菜单下发

- 登录后后端按当前用户权限码过滤菜单，返回菜单树给前端。
- 前端 `PluginRouteScanner` 扫描 `views/**` 路由 + 后端菜单做**交集**，渲染侧边栏（见 [`frontend/common/router.md`](../frontend/common/router.md) 与 [`frontend/admin-ele/layout.md`](../frontend/admin-ele/layout.md)）。

---

## 3. 约定

- 菜单 `title` 用 i18n key（如 `system.role.title`），前端 `$t` 渲染。
- 菜单 `authority` 与接口权限码一致，保证「无权限不显示菜单 + 接口也拦截」双保险。
- 外链菜单用 `IFrameView` 以 iframe 内嵌。

---

## 4. 初始化

基础菜单由安装向导/seed 写入（见 [`getting-started/installation.md`](../getting-started/installation.md)）。
