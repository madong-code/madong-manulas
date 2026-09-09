# 开发规范 · API

---

## 1. 路径

- 后台：`/adminapi/<module>/<entity>`（见 [`backend/architecture/multi-app.md`](../backend/architecture/multi-app.md)）。
- C 端：`/api/<module>/<entity>`。
- 安装：`/install/...`。

RESTful 动作：

| 动作 | 方法 + 路径 |
| ---- | ---- |
| 列表 | `GET /<module>/<entity>` |
| 详情 | `GET /<module>/<entity>/{id}` |
| 新增 | `POST /<module>/<entity>` |
| 更新 | `PUT /<module>/<entity>/{id}` |
| 删除 | `DELETE /<module>/<entity>/{id}` 或 `DELETE /<module>/<entity>`（批量） |
| 自定义 | `PUT /<module>/<entity>/{id}/<action>` |

---

## 2. 响应结构

统一（见 [`backend/basic/request-response.md`](../backend/basic/request-response.md)）：

```json
{ "code": 200, "message": "ok", "data": { ... } }
```

分页：`data = { items, total, page, pageSize }`。

---

## 3. 查询前缀

前端 `searchForm` 字段名带 `EQ_`/`LIKE_`/`IN_`/`BETWEEN_` 等前缀，后端 `search()` 解析。详见 [request-response.md](../backend/basic/request-response.md)。

---

## 4. 权限码

- 每个写/读接口必须 `#[Permission(code)]`。
- 格式 `module:entity:action`，与前端 `meta.authority`/按钮 `code` 一致。
- 超管 `superCodes=['*']` 放行。

---

## 5. 字段类型

- `id` 字符串（避免 JS 精度问题）。
- 时间 `Y-m-d H:i:s` 字符串。
- 状态 `0/1` 或字符串枚举。

---

## 6. 文档

- 接口用 Swagger 注解声明（`#[OA\Get]` + `#[PageResponse]` + `SchemaConstants::X_SCHEMA_REQUEST`）。
- DTO 放 `app/adminapi/schema/request|response/`，保证文档与校验一致。
