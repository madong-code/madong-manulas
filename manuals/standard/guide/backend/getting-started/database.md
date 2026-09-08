# 数据库操作

## ORM 与连接

后端使用 **Laravel Illuminate Database（^11.33）** 作为 ORM（非 think-orm）。默认连接定义在 `config/database.php`，表前缀为 `md_`。

```php
use Illuminate\Support\Facades\DB;

// 原生 / 查询构造器
$rows = DB::table('sys_post')->where('enabled', 1)->orderBy('sort')->get();

// 模型
use app\model\system\org\Post;
$post = Post::find(1);
```

## Model 定义

```php
namespace app\model\system\org;

use core\foundation\base\BaseModel;

class Post extends BaseModel
{
    protected $primaryKey = 'id';
    protected $table = 'sys_post';                 // 实际表名（无前缀）
    protected $appends = ['created_date', 'updated_date']; // 虚拟字段

    protected $fillable = [                        // 批量赋值白名单
        'id', 'dept_id', 'code', 'name', 'sort',
        'enabled', 'created_by', 'updated_by',
        'created_at', 'updated_at', 'deleted_at', 'remark',
    ];

    protected $casts = [                           // 类型转换（存 string，读 string）
        'created_by' => 'string',
        'dept_id'    => 'string',
        'id'         => 'string',
        'updated_by' => 'string',
    ];

    public function dept(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Dept::class, 'dept_id', 'id');
    }
}
```

> 表名省略前缀：`$table='sys_post'` 实际对应 `md_sys_post`（取决于 `database.php` 中 `prefix`）。

## Dao 层封装

`BaseDao` 提供通用查询、分页、软删除能力，`setModel()` 指定模型：

```php
namespace app\dao\system\org;

use app\model\system\org\Post;
use core\foundation\base\BaseDao;

class PostDao extends BaseDao
{
    protected function setModel(): string
    {
        return Post::class;
    }
}
```

## Service 层调用

```php
namespace app\service\admin\system\org;

use app\dao\system\org\PostDao;
use core\foundation\base\BaseService;

class PostService extends BaseService
{
    public function __construct(PostDao $dao)
    {
        $this->dao = $dao;
    }

    public function save(array $data)
    {
        return $this->dao->create($data);
    }
}
```

## 迁移（Migration）

表结构通过 **Phinx** 迁移脚本维护，位于 `backend/resource/database/migrations/`：

```bash
php start.php migrate        # 执行迁移
php start.php migrate:rollback
```

新建表请新增迁移文件，不要手动改库，以保证多环境一致。

## 事务

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    // 多步写操作
});
```

> 常驻内存注意：不要在请求之间复用数据库连接对象或把 Model 实例存为静态属性，避免连接状态污染。
