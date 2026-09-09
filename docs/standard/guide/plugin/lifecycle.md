# 插件 · 生命周期

插件经历 安装 → 启用 → 使用 → 升级 → 卸载 五个阶段。

---

## 1. 安装（Installing → Installed）

`Install.php` 作为入口，安装流程一般做：
1. 复制前端模板 `resource/template/admin/**` → `template/admin/src/**`。
2. 执行数据库建表（`resource/database/` 或迁移）。
3. 写入初始数据（菜单、权限码、字典）。
4. 注册路由/事件监听器。
5. 触发 `plugin.installed` 事件。

> 安装期间 `.env` 监控被临时关闭（`config/process.php` 中 `.env` 注释避免安装失联）。

---

## 2. 启用 / 禁用

- 启用：插件后端代码被 Webman 扫描加载，前端路由合并。
- 禁用：停止加载（路由/菜单移除），数据保留。

---

## 3. 升级（Updating → Updated）

- 覆盖插件目录代码与模板。
- 执行增量迁移（新表/新字段）。
- 同步前端模板（注意用户自定义冲突）。
- 触发 `plugin.updated` 事件。

---

## 4. 卸载（Uninstalling → Uninstalled）

- 移除前端模板与路由。
- 可选清理数据库（菜单/权限/表，需确认避免误删业务数据）。
- 触发 `plugin.uninstalled` 事件。

---

## 5. 事件钩子

`config/event.php` 预留：

```php
'plugin.installing'  => [],
'plugin.installed'   => [],
'plugin.uninstalling' => [],
'plugin.uninstalled'  => [],
'plugin.updating'     => [],
'plugin.updated'      => [],
```

实际监听由插件自身注册。

---

## 6. 约定

- 安装/卸载必须**幂等**，重复执行不产生破坏。
- 卸载默认保留用户数据，彻底清理需显式确认。
- 模板源（`resource/template`）与运行时（`template/admin`）保持一致，便于重新同步。
