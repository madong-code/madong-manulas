# 后端 · 缓存与 Redis

缓存基于 Redis（`config/redis.php`），Webman 常驻，连接池复用。

---

## 1. 基础缓存

```php
use support\Cache;

Cache::set('key', $value, 3600);
$val = Cache::get('key');
Cache::delete('key');
```

---

## 2. Redis 直接操作

```php
use support\Redis;

Redis::set('foo', 'bar');
$bar = Redis::get('foo');
```

---

## 3. 典型用途

- **JWT 存储/黑名单**：`core/security/jwt/storage/RedisTokenStorage`、`RedisBlacklistStorage`（见 `dependence.php` 绑定）。
- **字典缓存**：`ApiDict` 前端下拉的字典数据后端缓存，减少查表。
- **菜单/权限树**：用户权限码、菜单树缓存，登录时写入，变更时失效。
- **队列**：Redis 列表作为队列（见 [advanced/queue.md](./queue.md)）。
- **限流**：接口频次限制。

---

## 4. 缓存一致性

- 写操作后主动 `Cache::delete($key)` 失效相关缓存。
- 权限/菜单变更后清除用户缓存，强制重新拉取。

---

## 5. 约定

- 缓存 key 加业务前缀（如 `dict:`、`menu:`、`perm:`），避免冲突。
- 不缓存大对象（超 1MB 谨慎）。
- 生产 Redis 启用密码（`REDIS_PASSWORD`）。
