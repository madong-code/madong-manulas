# 后端 · 依赖注入容器

后端使用 **PHP-DI** 作为容器（`config/container.php`），支持自动装配与属性注入。

---

## 1. 容器构建

```php
$builder = new \DI\ContainerBuilder();
$builder->addDefinitions(config('dependence', [])); // dependence.php 预留绑定
$builder->useAutowiring(true);   // 构造函数类型自动推断
$builder->useAttributes(true);   // 支持注解/属性
return $builder->build();
```

---

## 2. 自动注入

只要构造函数声明了类型，Webman 在解析 Controller/Service 时自动注入实例：

```php
class RoleController extends Crud
{
    public function __construct(RoleService $service, RoleValidate $validate)
    {
        $this->service  = $service;   // 自动注入
        $this->validate = $validate;  // 自动注入
    }
}
```

Service 注入 Dao 同理：

```php
class RoleService extends BaseService
{
    public function __construct(RoleDao $dao)
    {
        $this->dao = $dao;
    }
}
```

---

## 3. 手动获取（Container::make）

在非自动注入上下文（如静态方法、监听器）中手动取实例：

```php
use support\Container;

/** @var DeptService $service */
$service = Container::make(DeptService::class);
```

> 引用示例见 `RoleController::getDeptScope` 中用 `Container::make(DeptService::class)` 取部门服务。

---

## 4. 绑定自定义实现（dependence.php）

`config/dependence.php` 当前为空数组，预留用于绑定接口到实现（如 JWT 存储切换）：

```php
return [
    TokenStorageInterface::class => \DI\autowire(RedisTokenStorage::class),
];
```

---

## 5. 注意事项

- 容器实例在 worker 内常驻，**不要**在注入对象上保存跨请求可变状态。
- 改了新类后若注入失败，先 `composer dump-autoload`。
- 单例 vs 每次新建由 PHP-DI 默认（非单例，按需）。如需单例用 `#[Inject]` 或 `Container` 作用域。
