# 升级指南

---

## 通用升级流程

```bash
# 1. 拉取新版本
git pull

# 2. 后端依赖 + 迁移
cd backend
composer install
composer dump-autoload
php phinx migrate

# 3. 前端构建
cd template/mono && pnpm install && pnpm build -F @madong/admin && pnpm build -F @madong/platform && pnpm build -F @madong/install
cd template/web   && pnpm install && pnpm build

# 4. 重启
php webman restart
```

---

## 破坏性变更处理

### core/ 内核升级
- `core/` 不可手改，直接覆盖即可，`app/` 业务不受影响。
- 若基类方法签名变化，检查业务 Controller/Service 是否继承/调用旧签名。

### adapter/ 多 UI 变更
- 切换 UI 时 `adapter/component`、`adapter/form` 可能调整注册方式；按 [`frontend/common/add-new-ui.md`](../frontend/common/add-new-ui.md) 同步。

### 插件模板源 vs 运行时
- 升级插件后，`resource/template/admin/**` 与 `template/mono/apps/admin/**` 需重新同步（见 [`plugin/lifecycle.md`](../plugin/lifecycle.md)）。
- 用户自定义前端改动需注意覆盖冲突。

### 数据库迁移
- 迁移文件合入后不可改；升级产生的新迁移正向执行。
- 回滚需谨慎，先备份数据。

---

## 升级检查清单

- [ ] 备份数据库与 `.env`
- [ ] `composer dump-autoload` 后重启后端
- [ ] 重新构建前端静态
- [ ] 验证登录、菜单、核心 CRUD
- [ ] 检查插件是否需重新同步模板
- [ ] 确认 `monitor` 在生产关闭

---

## 回滚

- 代码：`git checkout <prev-tag>`。
- 数据库：用迁移回滚（若提供）或从备份恢复。
- 前端：重新构建旧版本 `dist/`。
