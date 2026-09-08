# 查询构造器

`madong/query` 是项目内置的查询参数解析/过滤库（零依赖，仅依赖 Illuminate），用于把前端传入的查询条件转换为 Eloquent 查询。

## 三种参数格式

### 1. 标准 filters 数组

```php
$params = [
    'filters' => [
        ['field' => 'name',   'operator' => 'like', 'value' => 'John'],
        ['field' => 'status', 'operator' => 'eq',   'value' => 'active'],
    ],
    'sort'  => ['created_at' => 'desc'],
    'limit' => 20,
];

$query = (new QueryParamsManager())->apply(Post::query(), $params);
$rows  = $query->get();
```

### 2. 大写前缀格式（列表页常用）

前端直接把条件拼成 `LIKE_name=John`、`EQ_status=active`：

```php
$params = [
    'LIKE_name'  => 'John',
    'EQ_status'  => 'active',
    'IN_type'    => '1,2',
    'BETWEEN_created_at' => '2025-01-01,2025-12-31',
];
```

## 支持的操作符（Operator 枚举）

| 前缀 | 含义 |
| --- | --- |
| `EQ_` | 等于 |
| `NE_` | 不等于 |
| `GT_` / `GTE_` | 大于 / 大于等于 |
| `LT_` / `LTE_` | 小于 / 小于等于 |
| `LIKE_` / `ILIKE_` | 模糊 / 不区分大小写模糊 |
| `IN_` / `NOT_IN_` | 包含 / 不包含（逗号分隔） |
| `BETWEEN_` / `NOT_BETWEEN_` | 范围（逗号分隔两端） |
| `NULL_` / `NOT_NULL_` | 为空 / 不为空 |

## 与 Crud 集成

`Crud` 基类通过 `getPageData` / `getSearchQueryParams` / `buildQuery(QueryBuilder)` 把请求参数转为 `madong\query` 的 QueryBuilder 并自动分页：

```php
protected function getPageData($query)
{
    $params = $this->getSearchQueryParams();   // 解析 LIKE_/EQ_/IN_/BETWEEN_ 等
    $builder = new QueryBuilder();             // madong\query
    $builder->apply($query, $params);
    return $builder->paginate(...);
}
```

业务代码通常无需手写查询构造，前端按前缀约定传参即可获得过滤、排序、分页。

## 在 Dao 中手动使用

```php
use madong\query\QueryParamsManager;

public function search(array $params)
{
    return (new QueryParamsManager())
        ->apply($this->getModel()->query(), $params)
        ->paginate($params['limit'] ?? 15);
}
```

> 前端对接：列表搜索统一使用 `LIKE_/EQ_/IN_/BETWEEN_` 前缀字段名（见[前端 - 请求](../frontend/admin/request.md)）。
