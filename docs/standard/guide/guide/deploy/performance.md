# 部署 · 性能

---

## 1. Webman worker

- `count = cpu_count() * 4`（见 `config/process.php`）。
- 常驻内存，省去每次请求引导开销。

---

## 2. OpCache

- 生产开启 `opcache.enable=1`、`opcache.validate_timestamps=0`（改代码需重启）。
- 配合关闭 `monitor` 进程。

---

## 3. 前端

- `pnpm build` 开启产物压缩、代码分包（`manualChunks` 拆 element-plus / vxe-table）。
- 静态资源走 CDN + 长缓存。
- 开 gzip/brotli（Nginx）。

---

## 4. 数据库

- 连接池复用；查询走索引；列表分页；避免 N+1。
- 热点数据（字典/菜单/权限）缓存 Redis。

---

## 5. 队列异步

- 耗时任务投 `madong-scheduler` 队列，不阻塞 HTTP worker（见 [`backend/advanced/queue.md`](../backend/advanced/queue.md)）。

---

## 6. 资源限制

- 限制 `client_max_body_size`（上传）。
- 设 `proxy_read_timeout` 防长请求挂起。
- 监控内存，防 worker 内存泄漏（常驻内存需定期 restart 观察）。
