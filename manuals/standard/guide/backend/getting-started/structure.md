# 模块结构

## 顶层目录

```
backend/
├── app/                  # 业务代码（可改）
│   ├── adminapi/         # 后台接口
│   │   ├── config/       # 模块路由（route.php）
│   │   ├── controller/   # 控制器
│   │   ├── service/      # 服务层
│   │   ├── validate/     # 验证器
│   │   ├── schema/       # DTO / OpenAPI Schema
│   │   ├── event/        # 事件
│   │   ├── listener/     # 事件监听器
│   │   └── middleware/   # 中间件
│   ├── api/              # 前台接口
│   ├── install/          # 安装向导
│   ├── plugin/           # 插件运行时（运行时读取）
│   ├── service/          # 公共服务（按业务域划分）
│   ├── dao/              # 数据访问层
│   ├── model/            # 模型层
│   ├── enum/             # 枚举
│   ├── exception/        # 自定义异常
│   └── queue/            # 队列消费者
├── core/                 # 框架核心（不可改）
├── config/               # 全局配置
├── plugin/               # 插件（webman 启动扫描注册）
├── resource/             # 资源（语言包、静态）
├── runtime/              # 运行时产物
├── static/               # 静态文件
├── public/               # Web 根目录（admin/web/install 产物）
├── process.php           # 进程（端口）配置
├── start.php             # Linux 启动脚本
└── windows.php           # Windows 启动脚本
```

## 业务域命名约定

后台模块按业务域组织，目录深度一致：

```
app/adminapi/controller/system/org/PostController.php
app/adminapi/service/admin/system/org/PostService.php
app/dao/system/org/PostDao.php
app/model/system/org/Post.php
app/adminapi/validate/system/org/PostValidate.php
```

> 命名空间与目录严格对应：`app\adminapi\controller\system\org`、`app\service\admin\system\org`、`app\dao\system\org`、`app\model\system\org`。

## 一个完整模块示例（岗位 Post）

四层文件一一对应：

| 层 | 文件 | 关键内容 |
| --- | --- | --- |
| Controller | `app/adminapi/controller/system/org/PostController.php` | `#[OA\Get(...)]` 注解路由、`extends Base`、调用 `PostService` |
| Service | `app/service/admin/system/org/PostService.php` | `extends BaseService`，构造函数注入 `PostDao` |
| Dao | `app/dao/system/org/PostDao.php` | `extends BaseDao`，`setModel()` 返回 `Post::class` |
| Model | `app/model/system/org/Post.php` | `extends BaseModel`，`$table='sys_post'`、`$fillable`、`$casts` |
| Validate | `app/adminapi/validate/system/org/PostValidate.php` | `extends BaseValidate`，规则 + 场景 |

新建模块推荐用命令行生成（`php start.php make:controller` 等），详见[二开指南 - 代码生成](../dev-guide/codegen.md)。
