# 内容审核

内置内容审核模块，支持「创建即提交审核」「审批流模式」「字段映射」，并通过插件扩展审核类型（见[应用插件](plugin.md)）。

## 配置

`config/review.php`：

```php
return [
    'flow' => [
        'enabled' => env('REVIEW_FLOW_ENABLED', false),     // 是否启用审批流（全局开关）
        'gateway' => env('REVIEW_FLOW_GATEWAY', NullApprovalFlowGateway::class),
    ],
    'auto_review' => [
        'reviewer_id' => env('REVIEW_AUTO_REVIEWER_ID', 0), // 自动审核人（0=系统）
    ],
    'types' => [
        'comment' => [
            'name'        => '评论审核',
            'model'       => 'app\\model\\comment\\Comment',
            'auto_submit' => true,                          // 创建时自动提交审核
        ],
        // 'question' 由官方插件 plugin/official/config/review.php 提供
    ],
    'status' => [
        'pending'  => 0,   // 待审核
        'approved' => 1,   // 已通过
        'rejected' => 2,   // 已拒绝
        'canceled' => 3,   // 已取消
    ],
    'default_field_mappings' => [ /* title/content/applicant 通用映射 */ ],
    'field_mappings'         => [ 'comment' => [ /* 类型特定映射 */ ] ],
    'scan_plugins'           => env('REVIEW_SCAN_PLUGINS', true), // 自动合并插件配置
];
```

## 状态与流程

- 审核状态：`pending(0)` / `approved(1)` / `rejected(2)` / `canceled(3)`。
- `auto_submit => true` 的审核类型，相关业务模型创建时自动提交审核。
- 审批流：`flow.enabled` 开启时走 `gateway`（默认 `NullApprovalFlowGateway` 本地闭环；可换装第三方 `workflow` 引擎插件）。

## 字段映射

审核详情页需要标题/内容/申请人等展示字段，通过 `field_mappings` 按类型配置来源：

- `type: attribute`：直接取模型字段（如 `source => content`）。
- `type: relation`：取关联模型字段（如 `source => author, attribute => username`）。
- `type: callback`：自定义闭包处理（如把评论内容截取成标题）。

## 插件扩展审核类型

在插件目录 `plugin/{name}/config/review.php` 中声明与系统一致结构的 `types` / `field_mappings`，系统启动时（`scan_plugins=true`）自动合并。无需改动核心即可新增审核类型（如 `question`、`article`）。

> 约定：新增业务审核类型，优先以插件方式扩展；若为核心内置类型，直接在 `config/review.php` 的 `types` / `field_mappings` 增加条目。
