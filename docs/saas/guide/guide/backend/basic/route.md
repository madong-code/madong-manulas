# 后端 · 路由

路由通过 **Swagger 注解 + `RouteUtil`** 自动注册，无需手写 `Route::get(...)`。

---

## 1. 路由文件

每个模块在 `app/adminapi/route/<module>/<module>.php`：

```php
use app\adminapi\controller\sys_admin_dept\SysAdminDeptController;
use madong\swagger\util\RouteUtil;

// 由代码生成器自动生成，请勿手动修改
RouteUtil::registerRoutes(SysAdminDeptController::class);
```

`RouteUtil::registerRoutes(Controller::class)` 会扫描该 Controller 上所有 `#[OA\Get]` / `#[OA\Post]` 等注解，按 `path` 注册路由，同时生成 Swagger 文档。

---

## 2. 注解定义路由

```php
#[OA\Get(path: '/system/role', summary: '列表', tags: ['角色管理'])]
#[Permission(code: ['system:role:list'])]
#[PageResponse(schema: RoleResponse::class)]
public function index(Request $request): \support\Response
{
    return parent::index($request);
}
```

| 注解 | 作用 |
| ---- | ---- |
| `#[OA\Get/Post/Put/Delete]` | 定义方法、路径、标签 |
| `#[Permission(code)]` | 绑定权限码（Casbin 校验） |
| `#[PageResponse]` / `#[SimpleResponse]` | 响应结构声明（分页/简单） |
| `#[RequestBody]` | 请求体结构（OpenAPI） |
| `SchemaConstants::X_SCHEMA_REQUEST` | 绑定请求 DTO（校验 + 文档） |

---

## 3. 路径约定

- 列表 `GET /system/role`
- 详情 `GET /system/role/{id}`
- 新增 `POST /system/role`
- 更新 `PUT /system/role/{id}`
- 删除 `DELETE /system/role/{id}` 或批量 `DELETE /system/role`
- 自定义动作 `PUT /system/role/{id}/change-status`

> `{id}` 在 Controller 中通过 `$request->route->param('id')` 获取。

---

## 4. 路由未生效排查

- 是否加了 `#[OA\Xxx]` 注解？
- 路由文件是否在 `route/<module>/` 且被加载？
- 改了 Controller 方法后是否重新生成路由文件（代码生成器）？
- 是否 `composer dump-autoload`？
