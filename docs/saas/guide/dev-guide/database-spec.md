# 开发规范 · 数据库

---

## 1. 命名

- 表：`mic_<module>_<entity>`（如 `mic_system_role`）。
- 字段：`snake_case`；主键 `id`（BIGINT）。
- 外键：`<entity>_id`（如 `role_id`）。
- 时间：`created_at` / `updated_at`（datetime）。
- 软删除：`deleted_at`（nullable）。

---

## 2. 字段类型

- 主键 `BIGINT UNSIGNED`，Model `$casts` 转 `string`。
- 状态/枚举 `TINYINT` 或 `INT`。
- 文本 `VARCHAR` / `TEXT`。
- 金额用「分」整数或 `DECIMAL(10,2)`（避免浮点误差）。

---

## 3. 索引

- 主键 `id`。
- 外键、常用查询字段加索引。
- 唯一约束（`unique`）在 Validate 用 `Rule::unique` 配合。

---

## 4. 迁移纪律

- 表结构演进**只走 Phinx 迁移**（见 [`backend/advanced/migration.md`](../backend/advanced/migration.md)）。
- 迁移文件合入后**不可修改**，改结构写新迁移。
- 禁止手动改生产库结构。

---

## 5. 多租户

- 租户相关业务表带租户字段，查询经 `AccessPermissionScope` 过滤（见 [`backend/modules/tenant.md`](../backend/modules/tenant.md)）。

---

## 6. 字符集

- 库/表 `utf8mb4` / `utf8mb4_unicode_ci`，支持 emoji。
