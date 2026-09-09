# 后端 · 异常与统一返回

---

## 1. 异常体系

- `core\foundation\exception\handler\AdminException`：业务异常（带业务码，如 400）。
- 全局异常处理器（`config/exception.php` + `core/foundation/exception`）拦截未捕获异常，转统一 JSON。

---

## 2. 业务异常用法

```php
use core\foundation\exception\handler\AdminException;

$data = $this->service->get($id);
if (empty($data)) {
    throw new AdminException('数据未找到', 400);
}
```

---

## 3. 统一返回

异常处理器将异常转为：

```json
{ "code": 400, "message": "数据未找到", "data": [] }
```

- 业务异常：用其 code/message。
- 系统异常：返回 500 + 通用错误（生产环境不泄露堆栈）。
- 校验失败：`Json::fail($e->getMessage())`（在 Controller try/catch 中已转）。

---

## 4. 错误码约定

- `200` 成功。
- `400` 业务错误（参数/数据）。
- `401` 未认证（token 失效）。
- `403` 无权限。
- `404` 资源不存在。
- `500` 系统错误。

> 完整错误码见 [`faq/error-code.md`](../faq/error-code.md)。

---

## 5. 约定

- 业务可预期的错误抛 `AdminException`（带友好文案）。
- 不可预期错误交给全局处理器，日志中记录堆栈（见 [log.md](./log.md)）。
