# 插件 · 前端

插件前端以「模板源」存在于 `plugin/<name>/resource/template/`，安装时合并进运行时前端。

---

## 1. 目录结构

```text
plugin/<name>/resource/template/
├── admin/                      # 后台前端模板
│   ├── views/                  # 页面（与 template/admin/src/views 一致结构）
│   ├── lang/                   # i18n 文案（json）
│   ├── routes/                 # 路由定义（index.ts）
│   └── page.vue                # 入口页
└── web/                        # 门户前端模板
```

以 `demo` 插件为例：
- `resource/template/admin/views/`：84 个 `.vue` 页面
- `resource/template/admin/lang/`：108 个 `.json` 文案
- `resource/template/admin/routes/index.ts`：路由注册
- `resource/template/web/`：门户模板

---

## 2. 页面与路由

- 页面沿用后台前端的 `useCrud` + `CrudSchema` 模式（见 [`frontend/admin-ele/index.md`](../frontend/admin-ele/index.md)）。
- 路由在 `routes/index.ts` 声明，`meta` 携带 `title`/`icon`/`authority`，与运行时 `views/**` 的 `PluginRouteScanner` 机制一致（见 [`frontend/common/router.md`](../frontend/common/router.md)）。

---

## 3. 文案

- `lang/*.json` 为多语言文案，安装时合并进 `template/admin/src/lang/`（或对应模块）。
- 文案 key 与运行时 i18n 体系一致（见 [`frontend/common/i18n.md`](../frontend/common/i18n.md)）。

---

## 4. 安装同步

- 安装插件：复制 `resource/template/admin/**` → `template/admin/src/**`。
- 升级插件：覆盖式同步（保留用户自定义需谨慎）。
- 开发期可直接把 `resource/template/admin/` 作为源维护，安装时同步到运行时。

---

## 5. 多套 UI 兼容

- 若插件需适配多套 UI（Element Plus / AntD / Naive），`resource/template/admin/` 下按 `adapter/` 抽象组织，业务 `views` 复用。
- 详见 [`frontend/common/add-new-ui.md`](../frontend/common/add-new-ui.md)。
