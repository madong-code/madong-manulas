# 后端 · 分层详解

---

## 1. Controller 层

基类：`core/foundation/base/BaseController` 与 `Crud`（通用 CRUD 控制器）。

典型 Controller（以 `RoleController` 为例）：

```php
#[Middleware(AccessTokenMiddleware::class, PermissionMiddleware::class, OperationMiddleware::class)]
final class RoleController extends Crud
{
    public function __construct(RoleService $service, RoleValidate $validate)
    {
        $this->service  = $service;
        $this->validate = $validate;
    }

    #[OA\Get(path: '/system/role', summary: '列表', tags: ['角色管理'])]
    #[Permission(code: ['system:role:list'])]
    #[PageResponse(schema: RoleResponse::class)]
    public function index(Request $request): \support\Response
    {
        return parent::index($request);   // 复用基类 CRUD
    }
}
```

要点：
- 继承 `Crud` 即拥有 `index/show/store/update/destroy/changeStatus` 通用动作。
- 通过 `#[Middleware(...)]` 声明中间件（鉴权、权限、操作日志）。
- 通过 `#[Permission(code: ...)]` 声明所需权限码（Casbin 校验）。
- 通过 Swagger 注解（`#[OA\Get]` / `#[PageResponse]`）自动生成文档与路由。

---

## 2. Service 层

基类：`core/foundation/base/BaseService`，提供 `list/save/update/get/delete/updateStatus` 等。

```php
class RoleService extends BaseService
{
    public function __construct(RoleDao $dao)
    {
        $this->dao = $dao;
    }

    public function updateScope(int $id, array $data)
    {
        // 业务编排：更新角色数据权限
        return $this->dao->update($id, $data);
    }
}
```

约定：
- Service 通过构造函数注入对应 Dao。
- 跨模块复用走 `service/core` 或 `Container::make(XxxService::class)`。

---

## 3. Dao 层

基类：`core/foundation/base/BaseDao`，封装条件构造、分页、树形。

```php
class RoleDao extends BaseDao
{
    protected ?string $model = Role::class;

    public function search($query, $params)
    {
        // 按 EQ_/LIKE_ 前缀解析查询条件
    }
}
```

约定：
- `$model` 指向对应 Model。
- 查询条件解析统一处理前端传来的 `EQ_`/`LIKE_` 等前缀（见 [basic/request-response.md](./request-response.md)）。

---

## 4. Model 层

基类：`core/foundation/base/BaseModel`（ThinkORM）。

```php
class Role extends BaseModel
{
    protected ?string $table = 'mic_system_role';
    protected array $casts = [
        'id'    => 'string',     // id 转字符串（前端一致）
        'sort'  => 'integer',
        'status'=> 'integer',
    ];
}
```

约定：
- `$casts` 统一做好字段类型转换（特别是 `id => string`）。
- 表名带前缀（`mic_`）。
- 关联、作用域放此处。

---

## 5. Validate 层

`app/adminapi/validate`，ThinkORM 验证器，按 `scene` 区分新增/更新/自定义。

```php
class RoleValidate extends Validate
{
    protected $rule = [
        'name|名称' => 'require|unique:mic_system_role,name',
    ];
    protected $scene = [
        'store'  => ['name'],
        'update' => ['name'],
    ];
}
```

> `Rule::unique` 在更新时须 `->ignore($id)` 避免唯一冲突（更新场景框架已处理）。
