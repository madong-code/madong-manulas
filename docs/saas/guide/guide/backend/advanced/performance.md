# 后端 · 性能调优

Webman 常驻内存，性能关键在「减少重复开销」与「正确隔离请求状态」。

---

## 1. worker 数

`config/process.php`：`webman` 的 `count` 默认 `cpu_count() * 4`。
- CPU 密集型可调低；IO 密集型可调高。
- 监控实际负载再调。

---

## 2. 常驻内存陷阱

- **不要**在类属性/静态变量跨请求保存可变状态（会串数据）。
- 改类后必须 `composer dump-autoload`；开发开 `monitor` 自动重载。
- 配置变更需 `php webman restart`。

---

## 3. 数据库与连接池

- 使用连接池（Webman 自动管理 MySQL/Redis 连接）。
- 查询走 Dao，避免 N+1（预加载关联）。
- 大列表分页，避免 `select *` 全表。

---

## 4. 缓存

- 字典 / 菜单 / 权限树 / JWT 黑名单走 Redis（见 [basic/cache.md](./cache.md)）。
- 热点数据加缓存，写后失效。

---

## 5. 队列与异步

- 耗时任务（消息、导入导出、统计）投队列异步（见 [queue.md](./queue.md)），不阻塞 HTTP worker。

---

## 6. OpCache

- 生产开启 PHP `opcache`，提升常驻脚本解析速度。
- `monitor` 进程仅开发用，生产关闭（`.env` 中注释）。

---

## 7. 监控

- `madong-scheduler` 进程常驻，监控队列积压与定时任务健康。
- 日志级别生产设为 `error`，避免 IO 瓶颈。
- 详见 [`deploy/monitor.md`](../../deploy/monitor.md)。
