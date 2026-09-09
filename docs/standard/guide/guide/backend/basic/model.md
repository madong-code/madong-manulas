# 模型 Model

Model 是表的映射，定义**表名、字段白名单、类型转换、关联关系**。继承 `core\foundation\base\BaseModel`（基于 Eloquent）。

```php
namespace app\model\system\org;

use core\foundation\base\BaseModel;

class Post extends BaseModel
{
    protected $primaryKey = 'id';
    protected $table = 'sys_post';                  // 实际表（前缀由 database 配置决定）

    protected $appends = ['created_date', 'updated_date']; // 附加虚拟字段

    protected $fillable = [                         // 批量赋值白名单（安全关键）
        'id', 'dept_id', 'code', 'name', 'sort',
        'enabled', 'created_by', 'updated_by',
        'created_at', 'updated_at', 'deleted_at', 'remark',
    ];

    protected $casts = [                            // 读写类型转换
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

## 关键属性

| 属性 | 作用 |
| --- | --- |
| `$table` | 表名（不含前缀） |
| `$primaryKey` | 主键，默认 `id` |
| `$fillable` | 允许 `create`/`update` 批量赋值的字段，防止越权写入 |
| `$guarded` | 黑名单（与 `$fillable` 二选一） |
| `$casts` | 字段类型转换（string/int/array/datetime/bool…） |
| `$appends` | 序列化时附加的虚拟字段（需有对应访问器） |
| `$hidden` | 序列化时隐藏字段 |

## 软删除

默认启用软删除（`deleted_at`），`delete` 不物理删行。回收站相关能力由 `Crud` 基类提供（`recycleList / recycleRestore / recycleDestroy`）。

## 时间戳

`created_at` / `updated_at` 由 Eloquent 自动维护；如需自定义格式，可重写访问器并加入 `$appends`。

## 注意事项（常驻内存）

- Model 实例**不要**存为静态属性或单例，避免跨请求状态污染。
- 关联关系用方法定义（如上 `dept()`），调用时 `->dept` 触发懒加载或配合 Dao 的 `with`。
