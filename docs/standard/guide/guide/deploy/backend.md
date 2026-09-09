# 后端部署

## 环境准备

- PHP >= 8.2，安装所需扩展（`pcntl`、`posix`、`redis`、`pdo_mysql`、`mbstring`、`openssl` 等）。
- MySQL 5.7+ / 8.0，Redis（3 个连接组）。
- Composer 2。

## 安装与构建

```bash
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env        # 按需填写数据库/Redis/JWT 等
php start.php migrate        # 执行数据库迁移
```

## 静态产物

构建前端并把产物放到 `backend/public/`：

- `template/admin/dist` → `backend/public/admin`
- `template/web/.output/public` → `backend/public/web`（Nuxt 当前 `ssr:false`，仅静态）
- `template/install/dist` → `backend/public/install`

## 启动

守护模式（推荐用 Supervisor，见[Supervisor 守护](supervisor.md)）：

```bash
cd backend
php start.php start -d
```

端口：HTTP `8500`，计划任务 `2001`（见 `config/process.php`）。

## 生产注意

- 关闭 `monitor` 自动重载（避免生产热更导致不一致），改代码走重启。
- 配置 `logrotate` 轮转 `runtime/log`。
- 用非 root 用户运行（如 `www-data`）。
- `.env` 中的密钥、数据库密码妥善保管，勿提交仓库。

## 健康检查

后端启动后访问 `http://<host>:8500/adminapi/openapi` 验证接口文档可达；或探测一个无需登录的健康接口（若已定义）。
