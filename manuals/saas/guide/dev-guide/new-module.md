# 新建模块

以新增「通知公告（Notice）」模块为例，完整走一遍四层 + 前端。

## 1. 建表（迁移）

`backend/resource/database/migrations/2026_01_01_000001_create_sys_notice.php`：

```php
use Phinx\Migration\AbstractMigration;

class CreateSysNotice extends AbstractMigration
{
    public function change()
    {
        $this->table('sys_notice')
            ->addColumn('title', 'string', ['limit' => 100, 'comment' => '标题'])
            ->addColumn('content', 'text', ['comment' => '内容'])
            ->addColumn('enabled', 'integer', ['default' => 1, 'comment' => '状态'])
            ->addTimestamps()
            ->create();
    }
}
```

```bash
php start.php migrate
```

## 2. 后端四层

按约定创建（命名空间与目录严格对应）：

| 文件 | 说明 |
| --- | --- |
| `app/model/system/org/Notice.php` | `extends BaseModel`，`$table='sys_notice'`，`$fillable` |
| `app/dao/system/org/NoticeDao.php` | `extends BaseDao`，`setModel()` 返回 `Notice::class` |
| `app/service/admin/system/org/NoticeService.php` | `extends BaseService`，注入 `NoticeDao` |
| `app/adminapi/validate/system/org/NoticeValidate.php` | `extends BaseValidate`，规则 + 场景 |
| `app/adminapi/controller/system/org/NoticeController.php` | `extends Crud`，注解路由 + `#[Permission(...)]` |

控制器关键点（参考 PostController）：

```php
#[Middleware(AccessTokenMiddleware::class, PermissionMiddleware::class, OperationMiddleware::class)]
final class NoticeController extends Crud
{
    public function __construct(NoticeService $service, NoticeValidate $validate)
    {
        $this->service  = $service;
        $this->validate = $validate;
    }

    #[OA\Get(path: '/system/notice', summary: '列表', tags: ['通知公告'])]
    #[Permission(code: 'org:notice:list')]
    public function index(Request $request): \support\Response
    {
        return parent::index($request);
    }
}
```

## 3. 导入菜单与权限

- 后台菜单通过数据脚本/后台界面录入，权限码由 `#[Permission]` 注解声明。
- 可运行 `php webman madong:permission:collect` 收集权限码（见[代码生成](codegen.md) 命令）。

## 4. 前端页面（admin）

在 `template/mono/apps/admin/src/views/system/notice/` 下用 `CrudSchema` + `useCrud` 生成列表与表单（详见[前端 - CRUD](../frontend/mono/components/crud/overview.md)）。

## 5. 联调与重启

改完后端执行 `php start.php restart`，前端 dev server 保持运行，浏览器验证列表/新增/编辑/删除。

> 若模块需要插件化（独立分发），改为放在 `backend/plugin/{name}/` 下，遵循[应用插件](advanced/plugin.md) 约定。
