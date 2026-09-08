# 后端 · 定时任务

定时任务由 `madong-scheduler` 进程统一调度（Cron 风格）。

---

## 1. 调度进程

`config/process.php` 的 `madong-scheduler` 进程同时承担定时调度（见 [queue.md](./queue.md)）。

调度配置通常在 `config/core.infrastructure.scheduler.*` 或专用 scheduler 配置中声明任务表达式与回调。

---

## 2. 注册定时任务

任务以「表达式 + 处理器」形式注册：

```php
// 在 scheduler 配置/启动钩子中
$scheduler->cron('0 2 * * *', function () {
    // 每日凌晨 2 点执行：清理日志 / 统计报表
});
```

---

## 3. 典型用途

- 每日统计报表生成。
- 过期会话/缓存清理。
- 队列积压监控。
- 租户配额校验。

---

## 4. 约定

- 长任务避免在定时回调里同步执行，改投队列异步。
- 任务需幂等（重复执行不产生副作用）。
- 单进程调度（`count=1`），避免重复触发；多实例需分布式锁。
