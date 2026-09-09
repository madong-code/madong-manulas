# 控制器 Controller

控制器只做三件事：**接收请求参数、触发业务、封装响应**。不写业务逻辑、不直接操作数据库。

## 路由：OpenAPI 注解

路由不写在 `route.php` 里，而是用 `#[OA\Get/Post/Put/Delete(...)]` 注解声明，由 `webman-tech/swagger` 在启动时扫描 `app/adminapi`、`app/install`、`app/schema` 自动注册。

```php
namespace app\adminapi\controller\system;

use app\adminapi\controller\Crud;
use app\adminapi\middleware\AccessTokenMiddleware;
use app\adminapi\middleware\OperationMiddleware;
use app\adminapi\middleware\PermissionMiddleware;
use app\adminapi\validate\system\org\PostValidate;
use app\service\admin\system\org\PostService;
use madong\swagger\attribute\Permission;
use OpenApi\Attributes as OA;
use support\annotation\Middleware;

#[Middleware(AccessTokenMiddleware::class, PermissionMiddleware::class, OperationMiddleware::class)]
final class PostController extends Crud
{
    public function __construct(PostService $service, PostValidate $validate)
    {
        $this->service  = $service;   // 注入 Service
        $this->validate = $validate;  // 注入 Validate
    }

    #[OA\Get(path: '/system/post', summary: '列表', tags: ['岗位管理'])]
    #[Permission(code: 'org:post:list')]            // 权限码
    public function index(Request $request): \support\Response
    {
        // 调用父类 Crud::index 完成列表查询
        return parent::index($request);
    }
}
```

要点：

- 路由前缀 `/adminapi` 由 `app/adminapi/config/route.php` 的 `Route::group` 统一添加，注解里只写相对路径 `/system/post`。
- `tags` 用于 Swagger 文档分组；`summary` 是接口名称。
- `#[Permission(code: ...)]` 声明接口所需权限（见[权限管理](permission.md)）。
- `#[Middleware(...)]` 声明该控制器要走的中间件链。

## 继承通用 Crud

`app/adminapi/controller/Crud` 已内置 `index / store / update / show / destroy / batchDelete / changeStatus / export` 等通用方法。大多数资源只需声明注解并 `return parent::xxx($request)` 即可，无需重复实现分页与增删改。

## 响应封装

统一用 `core\foundation\tool\Json`：

```php
use core\foundation\tool\Json;

return Json::success('ok', $data);   // code=0
return Json::fail('错误信息');        // code!=0
```

异常由全局异常处理器转为统一 JSON 结构，业务侧抛 `core\foundation\exception\handler\AdminException` 即可。

## 接收参数

```php
$id   = $request->route->param('id');  // 路由参数
$page = $request->input('page', 1);    // query / body 参数，带默认值
$all  = $request->all();               // 全部
```
