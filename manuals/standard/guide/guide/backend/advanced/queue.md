# 后端 · 队列

队列基于 Redis，由 `madong-scheduler` 进程消费，用于异步处理耗时任务。

---

## 1. 进程

`config/process.php` 中 `madong-scheduler`：

```php
'madong-scheduler' => [
    'handler' => \core\infrastructure\scheduler\SchedulerServer::class,
    'count'   => 1,
    'listen'  => 'text://' . config('core.infrastructure.scheduler.listen', '127.0.0.1:2001'),
],
```

- 该进程既负责**定时调度**，也负责**队列消费**。
- 监听端口来自 `config('core.infrastructure.scheduler.listen')`（默认 `127.0.0.1:2001`）。

---

## 2. 生产者（投递任务）

业务代码中将任务推入队列（Redis 列表），由消费者异步执行。典型场景：发送消息、导入导出、统计计算。

```php
// 伪代码：投递
Queue::push(SendMessageJob::class, $payload);
```

---

## 3. 消费者（Queue 目录）

消费者位于 `app/queue/`，实现消费逻辑：

```php
namespace app\queue;

class SendMessageConsumer
{
    public function handle(array $data)
    {
        // 发送消息等业务
    }
}
```

> 具体消费注册方式以 `core/infrastructure/scheduler` 的队列驱动为准。

---

## 4. 约定

- 队列任务**幂等**：消费失败可重试，避免重复副作用。
- 不在队列闭包里捕获请求上下文（请求生命周期已结束）。
- 消费异常要记录日志，避免静默丢失。
- 生产环境 `madong-scheduler` 进程必须常驻（`php webman start madong-scheduler`）。
