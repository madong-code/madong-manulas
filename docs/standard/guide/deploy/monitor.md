# 部署 · 监控

---

## 1. 进程监控

- Supervisor / systemd 守护主进程，崩溃自动重启（见 [supervisor.md](./supervisor.md)）。
- `madong-scheduler` 进程必须常驻（队列 + 定时任务）。

---

## 2. 日志

- 后端：`runtime/logs/`，生产级别 `error`（见 [`backend/basic/log.md`](../backend/basic/log.md)）。
- 前端：浏览器 console + 网关访问日志。
- 用 `logrotate` 轮转，防磁盘满。

---

## 3. 健康检查

- 后端：`GET /adminapi/ping` 探活（Nginx/负载均衡健康检查）。
- 数据库/Redis：外部探活脚本。

---

## 4. 指标

- QPS、响应耗时、错误率（网关/APM）。
- 队列积压长度（Redis list size）。
- worker 内存（防泄漏）。

---

## 5. 告警

- 进程退出、探活失败、错误率突增、磁盘/内存阈值。
- 关键业务异常（登录失败暴增等）可经消息推送（见 [`backend/advanced/event.md`](../backend/advanced/event.md) 的 `message.push` 事件）。

---

## 6. 升级与回滚

- 后端：`git` 切换版本 + `composer dump-autoload` + `php webman restart`。
- 前端：重新构建部署 `dist/`。
- 数据库迁移：迁移可正向，回滚需谨慎（见 [`backend/advanced/migration.md`](../backend/advanced/migration.md)）。
