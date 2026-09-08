# 后端 · 请求与响应约定

---

## 1. 查询条件前缀

前端 `searchForm` 字段名带前缀，后端 Dao 按前缀解析（前后端一致）。

| 前缀 | 含义 | 示例 |
| ---- | ---- | ---- |
| `EQ_` | 等于 | `EQ_status=1` |
| `NE_` | 不等于 | `NE_status=0` |
| `LIKE_` | 模糊 | `LIKE_name=张` |
| `GT_` | 大于 | `GT_created_at=...` |
| `LT_` | 小于 | `LT_sort=10` |
| `GTE_` | 大于等于 | `GTE_sort=1` |
| `LTE_` | 小于等于 | `LTE_sort=100` |
| `IN_` | 在集合 | `IN_id=1,2,3` |
| `BETWEEN_` | 区间 | `BETWEEN_created_at=...` |

> 前缀是**字符串直接提交**，前端提交拦截器不要剥离；后端 `search()` 解析。对应前端见 [`frontend/admin-ele/table.md`](../frontend/admin-ele/table.md)。

---

## 2. 统一响应结构

通过 `core\foundation\tool\Json` 返回：

```json
{
  "code": 200,
  "message": "ok",
  "data": { ... }
}
```

- 成功：`Json::success('ok', $data)`（code=200）。
- 失败：`Json::fail('错误信息', [], 400)`。
- 分页列表：
```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

> 前端 `BasicCrud` 期望 `{ items, total, page, pageSize }` 结构，后端必须按此返回（见 [`frontend/admin-ele/table.md`](../frontend/admin-ele/table.md)）。

---

## 3. 字段类型

- `id` 统一字符串。
- 时间字段字符串（`Y-m-d H:i:s`）。
- 布尔/状态用 `0/1` 整数或字符串枚举，前后端约定一致。

---

## 4. 请求体 DTO

请求结构由 `app/adminapi/schema/request/*` 的 DTO 类声明（供 Swagger 文档与校验）：

```php
#[OA\Schema(...)]
class RoleFormRequest { /* 字段定义 */ }
```

Controller 注解中通过 `SchemaConstants::X_SCHEMA_REQUEST => RoleFormRequest::class` 绑定。
