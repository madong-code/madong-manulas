# 服务层 Service

Service 承载**业务逻辑与事务编排**，是 Controller 与 Dao 之间唯一的业务入口。

## 基类与依赖

```php
namespace app\service\admin\system\org;

use app\dao\system\org\PostDao;
use core\foundation\base\BaseService;

class PostService extends BaseService
{
    public function __construct(PostDao $dao)
    {
        $this->dao = $dao;   // 注入 Dao，BaseService 提供通用 CRUD 方法
    }
}
```

`BaseService` 已提供：`save / update / get / getCount / selectList / delete / deleteMany` 等，覆盖了绝大多数单表场景，子类通常只需注入 Dao，无需额外代码。

## 组合业务逻辑

需要跨表或复杂逻辑时，在 Service 中编排：

```php
public function createPostWithDept(array $data): Post
{
    return DB::transaction(function () use ($data) {
        $post = $this->dao->create($data);
        // 其它业务：写日志、发事件、更新部门统计……
        return $post;
    });
}
```

## 调用 Dao

Service 只向下调用 Dao，不直接 `new Model` 做查询（查询统一收敛到 Dao）：

```php
$list = $this->dao->selectList($where, $field, $page, $limit, $order, ['dept']);
$count = $this->dao->getCount($where);
```

## 触发事件（解耦副作用）

业务完成后可通过事件通知其它模块（如消息推送、操作日志）：

```php
event(new PostCreatedEvent($post));
```

> 原则：Controller 不写事务；事务与业务规则放在 Service。Service 之间可互相调用，但不得反向依赖 Controller / Validate。
