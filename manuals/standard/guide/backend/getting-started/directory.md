# 后端 · 目录结构

```text
backend/
├── app/                          # ★ 业务代码（可改）
│   ├── adminapi/                 # 后台接口应用
│   │   ├── controller/           # 控制器（按模块分子目录 system/member/...）
│   │   ├── validate/             # 参数校验（ThinkORM 验证器，按场景 scene）
│   │   ├── schema/               # 请求/响应 DTO（request/response 子目录，供 Swagger）
│   │   └── route/                # 路由注册文件（每个模块一个，自动生成勿手改）
│   ├── api/                      # C 端接口应用
│   ├── install/                  # 安装向导应用
│   ├── service/                  # ★ 业务逻辑层（admin/api/core 子目录）
│   │   ├── admin/                # 后台业务（system/member/content/ops/web/site/plugin）
│   │   ├── api/                  # C 端业务
│   │   └── core/                 # 跨应用公共业务
│   ├── dao/                      # ★ 数据访问层（system/member/content/ops/web/site/plugin）
│   ├── model/                    # ★ 模型层（对应数据表，含 $casts 类型转换）
│   ├── enum/                     # 枚举（状态码、类型等）
│   ├── middleware/               # 应用级中间件
│   ├── event/ listener/          # 事件与监听器
│   ├── queue/                    # 队列消费者
│   ├── process/                  # 自定义进程
│   ├── command/                  # 命令行指令
│   ├── scope/                    # 模型作用域（global 数据权限 / scope 行级）
│   ├── schema/                   # 公共 DTO（BatchDeleteRequest / IdRequest 等）
│   ├── exception/                # 业务异常
│   ├── bootstrap/                # 启动钩子
│   └── migration/               # 业务迁移
├── core/                         # ★ 内核（不可改）
│   ├── foundation/               # 基础类 BaseController/Crud/BaseService/BaseDao/BaseModel
│   ├── security/                 # JWT、加密
│   ├── tool/                     # Json 响应、工具
│   ├── exception/               # 异常处理器
│   └── ...
├── config/                       # 配置（app/server/database/redis/container/middleware/...）
├── public/                       # Web 根（静态资源、入口 index.php）
├── runtime/                      # 运行时（日志、缓存、install.lock）
├── phinx.php                     # 迁移配置
├── composer.json
└── webman                   # 启动脚本
```

---

## 分层职责速览

| 层 | 目录 | 职责 | 可否改 |
| ---- | ---- | ---- | ---- |
| Controller | `app/adminapi/controller` | 接收请求、调 Service、返回 JSON | 可 |
| Validate | `app/adminapi/validate` | 入参校验（scene） | 可 |
| Service | `app/service` | 业务逻辑编排 | 可 |
| DAO | `app/dao` | 数据查询封装 | 可 |
| Model | `app/model` | 表映射、字段类型、关联 | 可 |
| 内核基类 | `core/foundation/base` | 通用 CRUD/响应 | 不可 |

> 命名空间约定：`app\adminapi\controller\system\RoleController` 对应路径 `app/adminapi/controller/system/RoleController.php`。
