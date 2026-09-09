# 数据访问 Dao

Dao 层负责**所有数据库读写**，封装查询构造、分页、软删除，让 Service 无需关心 SQL 细节。

## 基类

```php
namespace app\dao\system\org;

use app\model\system\org\Post;
use core\foundation\base\BaseDao;

class PostDao extends BaseDao
{
    protected function setModel(): string
    {
        return Post::class;   // 绑定模型
    }
}
```

`BaseDao` 常用能力：

| 方法 | 说明 |
| --- | --- |
| `create($data)` | 插入并返回模型 |
| `update($id, $data)` | 按主键更新 |
| `get($id, $columns, $with)` | 取单条（可带关联） |
| `getCount($where)` | 计数 |
| `selectList($where, $field, $page, $limit, $order, $with)` | 分页列表 |
| `delete($id)` / `deleteMany($ids)` | 删除（软删除） |
| `getModel()` | 获取模型实例，便于自定义查询 |

## 自定义查询

需要复杂查询时在 Dao 内写方法，仍走 Eloquent：

```php
public function enabledList(): array
{
    return $this->getModel()
        ->where('enabled', 1)
        ->orderBy('sort')
        ->get()
        ->toArray();
}
```

## 关联与字段白名单

`selectList` 的最后一个参数传入关联名（如 `['dept']`），自动 `with()` 预加载，避免 N+1。字段白名单由 Model 的 `$fillable` 控制，防止越权字段写入。

> 约定：所有查询入口收敛到 Dao；不要在 Service 里直接 `Model::where(...)` 拼查询（简单场景可用，但复杂查询强烈建议下沉到 Dao 以便复用与测试）。
