# 消息推送

后端通过 `core\communication\notify\MessagePusher` 统一发送消息通知，支持站内信落库 + 实时推送（基于 `webman/push` 的 WebSocket 通道）。

## 发送消息

```php
use core\communication\notify\MessagePusher;
use app\enum\system\MessagePriority;

$result = MessagePusher::create()
    ->send(
        userIds: $userId,                       // 接收者ID或数组
        definitionKey: 'approval_wait',         // 消息定义 key（安装时导入 sys_message_definition）
        title: '待办审批',
        content: '您有一条新的审批待处理',
        relatedId: $approvalId,                 // 关联业务ID
        actionUrl: '/approval/detail?id=' . $approvalId,
        options: [
            'priority'   => MessagePriority::HIGH->value, // 优先级
            'sender_id'  => $currentUserId,
            'module'     => 'admin',            // 业务模块，默认 admin
            'event'      => 'message',          // 事件类型，默认 message
            'extra_data' => ['badge' => 1],     // 附加推送数据
            'scene'      => 'approval',         // 场景标识（日志追踪）
        ]
    );
// 返回 ['push_count' => int, 'messages' => array]
```

## 关键概念

- **definitionKey**：消息定义键，对应 `sys_message_definition` 表。定义由核心/插件在 `resource/data/message/category.php` 提供，安装时自动导入。
- **优先级**：`app\enum\system\MessagePriority`（如 NORMAL=3、HIGH 等）。
- **推送客户端类型**：`core\communication\notify\enum\PushClientType` 决定推送到哪些端（站内、WebSocket 等）。
- **force**：`options['force'] = true` 可跳过订阅过滤，强制推送。

## 事件驱动

发送会派发 `app\adminapi\event\content\MessagePushEvent`，由监听器负责实时通道投递与落库，业务侧只需调用 `send()`。

## 实时通道（WebSocket）

`webman/push` 提供 WebSocket 服务（端口见 `config/process.php` 的 push 进程）。前端订阅频道后，消息通过 WebSocket 即时到达，无需轮询。

> 使用建议：业务侧统一经 `MessagePusher` 发送，不要在业务里直接操作 WebSocket；消息定义（definitionKey）优先在安装数据中集中声明，便于多语言与统一管理。
