# 代码生成

后端提供两类脚手架：单文件脚手架（`madong-make:*`）与插件/安装脚本（`madong-plugin:*`）。命令基于 Symfony Console，注册用 `#[AsCommand]`。

## 单文件脚手架

stub 模板位于 `app/command/make/stubs`，生成到对应目录：

```bash
php webman madong-make:controller <Name>   # 控制器（含 Crud 继承、注解）
php webman madong-make:service <Name>      # 服务层
php webman madong-make:dao <Name>          # Dao
php webman madong-make:model <Name>        # 模型
php webman madong-make:validate <Name>     # 验证器
php webman madong-make:middleware <Name>   # 中间件
```

示例：

```bash
php webman madong-make:controller Notice
# 生成 app/adminapi/controller/system/org/NoticeController.php（按约定路径）
```

## 插件命令

```bash
php webman madong-plugin:develop:create <snake_name> <Title>   # 新建插件模板
php webman madong-plugin:develop:build <name>                  # 构建插件
php webman madong-plugin:install <name>                        # 安装（建表/导菜单/部署前端）
php webman madong-plugin:uninstall <name>                      # 卸载
php webman madong-plugin:list                                  # 列出插件
```

## 安装 / 配置 / 元数据

```bash
php webman install:madong                 # 系统安装
php webman madong-download:template <name>
php webman madong-config:mysql             # 写 MySQL 配置
php webman madong:migrate-admin-menu        # 同步后台菜单
php webman madong:permission:collect        # 收集权限码
```

## 全栈生成器

`skills/backend/generator/` 描述全栈代码生成器（`core/business/generator`），可基于表结构一次性产出后端四层 + 前端页面骨架，适合批量建模块。

> 生成后仍需人工补充：业务规则（Service）、复杂查询（Dao）、表单校验场景（Validate）、前端 CrudSchema 字段配置。脚手架只负责骨架，不负责业务。
