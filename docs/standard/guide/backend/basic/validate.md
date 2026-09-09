# 验证层 Validate

验证器基于 `core\foundation\base\BaseValidate`（场景化校验），用于在进入 Service 前拦截非法入参。

## 定义

```php
namespace app\adminapi\validate\system\org;

use app\model\system\org\Post;
use core\foundation\base\BaseValidate;

class PostValidate extends BaseValidate
{
    protected array $rules = [
        'dept_id' => 'required',
        'code'    => 'required|alphaNum|unique:' . Post::class . ',code',
        'name'    => 'required|max:16',
        'sort'    => 'numeric',
        'enabled' => 'required',
    ];

    protected array $messages = [
        'code.required' => '职位标识必须填写',
        'code.alphaNum' => '职位标识只能由英文字母或数字组成',
        'code.unique'   => '职位代码已被占用',
        'name.required' => '职位名称必须填写',
        'name.max'      => '职位名称最多不能超过16个字符',
    ];

    protected array $scenes = [
        'store'  => ['dept_id', 'code', 'name', 'sort', 'enabled'],
        'update' => ['code', 'name', 'sort', 'enabled'],
    ];

    // update 场景：unique 排除自身
    public function Update(): void
    {
        $this->only = $this->scenes['update'];
        $id = request()->route->param('id');
        $this->rules['code'] = 'required|alphaNum|unique:' . Post::class . ',code,' . ($id ?? 'NULL') . ',id';
    }
}
```

## 在控制器/CRUD 中触发

`Crud` 基类在 `store` / `update` 时自动按场景校验：

```php
if (isset($this->validate) && $this->validate) {
    if (!$this->validate->scene('store')->check($data)) {
        throw new \Exception($this->validate->getError());
    }
}
```

也可在自定义控制器方法中手动校验：

```php
if (!$this->validate->scene('store')->check($data)) {
    return Json::fail($this->validate->getError());
}
```

## 规则说明

- 规则语法兼容 Laravel 验证（如 `required`、`max`、`numeric`、`unique:Model,field`）。
- `scenes` 定义不同操作需要的字段集合，`scene('store')->check()` 只校验场景内字段。
- 唯一性校验 `unique:Model,field` 自动感知软删除。

> 原则：校验只负责「格式与基本约束」，复杂业务规则（如「同一部门下名称不唯一」）放到 Service 处理。
