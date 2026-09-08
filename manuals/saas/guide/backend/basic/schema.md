# DTO / Schemas

Schema 用于**声明接口的请求/响应数据结构**，同时驱动 Swagger 文档自动生成。基于 `OpenApi\Attributes` 注解 + `WebmanTech\DTO` 校验属性。

## 两类 Schema

| 类型 | 基类 | 位置 | 作用 |
| --- | --- | --- | --- |
| 请求 DTO | `app\schema\request\BaseFormRequest` | `app/adminapi/schema/request/...` | 描述入参、带校验规则 |
| 响应 DTO | `madong\swagger\schema\BaseResponseDTO` | `app/adminapi/schema/response/...` | 描述返回结构 |

## 请求 Schema 示例

```php
namespace app\adminapi\schema\request\system\org;

use app\schema\request\BaseFormRequest;
use OpenApi\Attributes as OA;
use WebmanTech\DTO\Attributes\ValidationRules;

#[OA\Schema(title: '岗位表单', description: '岗位创建和编辑接口共用的表单请求参数')]
class PostFormRequest extends BaseFormRequest
{
    #[OA\Property(property: 'dept_id', description: '部门ID', type: 'string', example: '246996721795072000')]
    #[ValidationRules(rules: 'required|string')]
    public string $dept_id;

    #[OA\Property(property: 'code', description: '岗位编码', type: 'string', example: 'SDF')]
    #[ValidationRules(rules: 'required|string|max:30|unique:sys_post,code')]
    public string $code;

    #[OA\Property(property: 'name', description: '岗位名称', type: 'string', example: 'AD')]
    #[ValidationRules(rules: 'required|string|max:50')]
    public string $name;

    #[OA\Property(property: 'sort', description: '排序号', type: 'integer', example: 0)]
    #[ValidationRules(rules: 'required|integer|min:0|max:1000')]
    public int $sort;

    #[OA\Property(property: 'enabled', description: '状态（1启用 0禁用）', type: 'integer', enum: [0, 1], example: 1)]
    #[ValidationRules(rules: 'required|integer|in:0,1')]
    public int $enabled;

    #[OA\Property(property: 'remark', description: '备注', type: 'string', nullable: true)]
    #[ValidationRules(rules: 'string|max:255|nullable')]
    public ?string $remark = null;
}
```

- `#[OA\Property(...)]`：文档描述（类型、示例、枚举）。
- `#[ValidationRules(rules: ...)]`：实际校验规则，运行时对参数生效。
- 属性默认值（如 `= null`）同时表达「可选 + 默认值」。

## 响应 Schema 示例

```php
namespace app\adminapi\schema\response\system;

use madong\swagger\schema\BaseResponseDTO;
use OpenApi\Attributes as OA;

#[OA\Schema(title: '岗位详情响应模型', description: '岗位详情接口的返回数据结构')]
class PostResponse extends BaseResponseDTO
{
    #[OA\Property(property: 'id', description: '岗位ID', type: 'string', example: '247048545520582656')]
    public string $id;

    #[OA\Property(property: 'name', description: '岗位名称', type: 'string', example: 'AD')]
    public string $name;

    #[OA\Property(property: 'created_date', description: '创建日期（本地格式化）', type: 'string')]
    public string $created_date;
    // …其余字段
}
```

## 在控制器中引用

Schema 通常作为 CRUD 的返回结构声明，或在方法注解里通过 `#[OA\Response(...)]` 关联：

```php
#[OA\Get(path: '/system/post/:id', summary: '详情', tags: ['岗位管理'])]
#[OA\Response(response: 200, description: '成功', content: new OA\JsonContent(ref: PostResponse::class))]
public function show(Request $request): \support\Response
{
    return parent::show($request);
}
```

## 与 Validate 的关系

- **Validate（BaseValidate）**：场景化、带业务上下文（如 update 排除自身）的校验，由 `Crud` 基类在 `store/update` 自动触发。
- **Schema（BaseFormRequest）**：属性级校验 + 文档描述，二者可并存；Schema 偏向「类型/格式」静态描述，Validate 偏向「动态业务规则」。

> 推荐：简单模块用 `Crud` + `Validate` 即可；对外暴露、需精确定义契约的接口，再补 Schema 提升文档质量。
