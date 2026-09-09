# 后端 · 事件与监听器

事件用于解耦业务：一个动作触发，多个监听器响应。

---

## 1. 事件注册

`config/event.php` 声明事件名 → 监听器映射：

```php
return [
    'adminapi.login.log'        => [[\app\adminapi\listener\system\LoginLogListener::class, 'handle']],
    'adminapi.operation.log'    => [[\app\adminapi\listener\system\OperationLogListener::class, 'handle']],
    'adminapi.menu.formatting'  => [[\app\adminapi\listener\system\MenuFormattingListener::class, 'handle']],
    'adminapi.points.changed'   => [[\app\adminapi\listener\member\PointsChangedListener::class, 'handle']],
    'adminapi.review.approved'  => [[\app\adminapi\listener\review\ReviewApprovedListener::class, 'handle']],
    'adminapi.message.push'     => [[\app\adminapi\listener\content\MessagePushListener::class, 'handle']],
    // 插件生命周期事件（空数组待实现）
    'plugin.installing'  => [],
    'plugin.installed'   => [],
    'plugin.uninstalling' => [],
    'plugin.uninstalled'  => [],
    'plugin.updating'     => [],
    'plugin.updated'      => [],
];
```

---

## 2. 监听器写法

```php
namespace app\adminapi\listener\system;

class LoginLogListener
{
    public function handle($event)
    {
        // 写登录日志
    }
}
```

---

## 3. 触发事件

```php
event('adminapi.login.log', $payload);
```

---

## 4. 典型事件

| 事件 | 监听器 | 用途 |
| ---- | ---- | ---- |
| `adminapi.login.log` | `LoginLogListener` | 登录日志 |
| `adminapi.operation.log` | `OperationLogListener` | 操作日志（配合 `OperationMiddleware`） |
| `adminapi.menu.formatting` | `MenuFormattingListener` | 菜单格式化 |
| `adminapi.points.changed` | `PointsChangedListener` | 会员积分变动 |
| `adminapi.review.*` | `Review*Listener` | 审核流程 |
| `adminapi.message.push` | `MessagePushListener` | 消息推送 |
| `plugin.*` | （预留） | 插件生命周期 |

---

## 5. 约定

- 监听器内不要抛未捕获异常（影响主流程），异常自行 try/catch + 日志。
- 耗时逻辑改投队列（见 [queue.md](./queue.md)）。
- 插件事件预留空数组，插件安装时动态注册。
