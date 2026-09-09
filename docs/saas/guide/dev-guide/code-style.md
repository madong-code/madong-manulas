# 编码规范

## 后端命名

| 场景 | 规范 | 示例 |
| --- | --- | --- |
| 控制器类 | 大驼峰 + `Controller` | `MenuController` |
| 服务类 | 大驼峰 + `Service` | `MenuService` |
| DAO 类 | 大驼峰 + `Dao` | `MenuDao` |
| 模型类 | 大驼峰（无后缀） | `Menu` |
| 验证器类 | 大驼峰 + `Validate` | `MenuValidate` |
| Schema Request | 大驼峰 + `Request` | `MenuCreateRequest` |
| Schema Response | 大驼峰 + `Response` | `MenuResponse` |
| 枚举类 | 大驼峰（PHP enum） | `MenuType` |
| 中间件类 | 大驼峰 + `Middleware` | `AdminAuthMiddleware` |
| 数据库表 | `{prefix}_{module}_{table}` | `system_menu`、`member_user` |
| 数据库字段 | snake_case | `created_at`、`parent_id` |
| 路由/权限码 | `{module}:{model}:{action}` | `system:menu:update` |
| JSON 响应字段 | snake_case | `items`、`total`、`page_no`、`page_size` |

## 分层约束

- 严格四层：**Controller → Service → Dao → Model**，只允许向下依赖。
- 查询统一收敛到 Dao；事务与业务规则放 Service；Controller 不写 SQL、不写事务。
- Model 不感知上层；不把 Model 实例存为静态/单例（常驻内存）。

## 前端命名

| 场景 | 规范 | 示例 |
| --- | --- | --- |
| 组件 | 大驼峰 .vue | `MenuModal.vue` |
| API 函数 | 小驼峰 | `getMenuList`、`createMenu` |
| 路由 code | `{App}{Module}{Action}` | `SystemMenuList` |
| 目录/文件 | kebab-case | `system/menu/index.vue` |

## Git 提交规范

```
<type>(<scope>): <subject>
```

| type | 说明 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `refactor` | 重构 |
| `style` | UI 样式 |
| `perf` | 性能优化 |
| `chore` | 构建/工具/配置 |
| `docs` | 文档 |
| `test` | 测试 |
| `revert` | 回退 |
| `types` | 类型变更 |
| `release` | 发版 |

| scope | 说明 |
| --- | --- |
| `backend` | 后端 |
| `admin` | Vben 后台前端 |
| `web` | Nuxt 前端 |
| `install` | 安装向导 |
| `project` / `lint` / `ci` / `deploy` | 项目 / Lint / CI / 部署 |

示例：

```
feat(admin): 新增会员积分管理页面
fix(web): 修复租户列表分页问题
refactor(backend): 重构菜单服务的查询逻辑
```

## 其它

- 接口契约（字段、权限码）为前后端共用，禁止为单一 UI 改后端契约。
- 多语言文案：后端加 `resource/translations/<lang>/*.php`，前端加对应 locale 文件，键名对齐。
- 代码格式化：后端遵循 PSR-12；前端使用 oxlint / eslint / stylelint / oxfmt（见 `cross/lint-format`）。
