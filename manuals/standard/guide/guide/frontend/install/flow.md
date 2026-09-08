# 安装向导 · 流程

本文描述 `install/` 前端与后端 `install` 应用协作的安装流程。

---

## 1. 总体流程

```text
① 环境检测 ──► ② 数据库配置 ──► ③ Redis 配置 ──► ④ 管理员创建 ──► ⑤ 初始化 ──► ⑥ 完成
```

---

## 2. 步骤详情

### ① 环境检测
- 检测 PHP 版本（≥ 8.2）、必需扩展（pdo、redis、mbstring 等）。
- 检测目录写权限（`runtime/`、`public/`）。
- 前端调用 `api/check-env`，后端返回通过/告警列表。

### ② 数据库配置
- 表单字段：host、port、database、username、password、表前缀。
- 前端 `api/test-db` 校验连接；后端 `install` 应用写入 `.env` 的 `DB_*`。

### ③ Redis 配置
- 字段：host、port、password、db。
- `api/test-redis` 校验；写入 `REDIS_*`。

### ④ 管理员创建
- 字段：账号、密码、确认密码、邮箱。
- 调用 `api/create-admin`，后端在 `member` / `system` 相关表写入超管（权限码 `*`）。

### ⑤ 初始化
- 执行 Phinx 迁移（`php phinx migrate`）创建表结构。
- 写入初始字典、菜单、角色数据（见 [`backend/basic/migration.md`](../../backend/basic/migration.md)）。
- 进度由后端返回，前端展示步骤条。

### ⑥ 完成
- 标记安装完成（写入锁定文件，如 `runtime/install.lock`）。
- 跳转后台登录页（`/admin`）。

---

## 3. 容错与回退

- 任一步骤失败可回退到上一步重填。
- 初始化失败应提供「清空已建表」能力，避免脏数据。
- 安装锁存在时再次访问 `/install` 应提示「已安装」。

---

## 4. 安全注意

- 安装接口 `install` 应用在生产环境建议安装完成后 **禁用或加访问限制**。
- 管理员密码须强校验（长度、复杂度）。
- 数据库/Redis 配置写入 `.env` 后权限应限制为仅服务用户可读。
