# 后端 · 日志

日志配置见 `config/log.php`，基于 Webman 日志组件（Monolog）。

---

## 1. 通道与级别

- 默认通道输出到 `runtime/logs/`。
- 级别：`debug` / `info` / `warning` / `error`。
- 生产环境建议 `error` 及以上，避免日志膨胀。

---

## 2. 用法

```php
use support\Log;

Log::info('role created', ['id' => $id]);
Log::error('db fail', ['e' => $e->getMessage()]);
```

---

## 3. 异常日志

未捕获异常由全局异常处理器记录 `error` 级日志（含堆栈），便于排查。

---

## 4. 操作日志

`OperationMiddleware` 将关键写操作（增删改）记录到数据库操作日志表（经 `service` 写入），可在后台「操作日志」查看。

---

## 5. 约定

- 不要在日志打印敏感信息（密码、token）。
- 高频日志用 `debug` 并在生产关闭。
- 日志轮转由 Webman 配置控制，避免单文件过大。
