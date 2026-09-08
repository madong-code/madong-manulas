# 后端 · 命令行

自定义命令行指令用于运维、数据修复、代码生成、插件管理、一次性任务。Madong 后端基于 **Symfony Console**（Webman）实现，提供了 **30 个**开箱即用的 `madong-*` 系列命令。

## 1. 运行方式

所有命令通过 Webman 控制台入口运行：

```bash
cd backend
php webman <命令名> [参数]
```

查看所有可用命令：

```bash
php webman list
```

查看某个命令的帮助：

```bash
php webman madong-plugin:install --help
```

> ⚠️ 命令代码位于 `app/command/`，按功能分目录组织（`check/` `config/` `install/` `make/` `metadata/` `plugin/` `tenant/`）。新增命令需放入对应目录并继承 `BaseCommand`。

## 2. 命令总览

| 分组 | 命令数 | 用途 |
| --- | --- | --- |
| [代码生成 `make/`](#3-代码生成-make) | 6 | 生成控制器 / DAO / 中间件 / 模型 / 服务 / 验证器 |
| [插件管理 `plugin/`](#4-插件管理-plugin) | 9 | 插件安装 / 卸载 / 打包 / 传输 / 迁移 |
| [配置同步 `config/`](#5-配置同步-config) | 5 | 菜单模板 / MySQL 配置同步 |
| [代码检查 `check/`](#6-代码检查-check) | 2 | 控制器 / 完整性检查 |
| [安装部署 `install/`](#7-安装部署-install) | 3 | 框架安装 / 模板下载 / 数据迁移 |
| [租户管理 `tenant/`](#8-租户管理-tenant) | 2 | 租户数据迁移 / 租户升级 |
| [元数据 `metadata/`](#9-元数据-metadata) | 1 | 权限码收集导出 |

## 3. 代码生成 make/

生成对应类文件（基于 `app/command/make/stubs/` 模板），**开发中最常用**。

### 3.1 生成控制器

```bash
php webman madong-make:controller TestController
# 带完整路径（含命名空间）
php webman madong-make:controller adminapi/controller/system/TestController
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 控制器名称，支持 `路径/类名` |

默认生成到 `app/controller/`，带路径时按 `app/<路径>/` 生成并自动推导命名空间。

### 3.2 生成 DAO

```bash
php webman madong-make:dao GoodsCategoryDao
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | DAO 名称，自动提取模型名（去掉 `Dao` 后缀） |

生成到 `app/dao/`。

### 3.3 生成中间件

```bash
php webman madong-make:middleware AuthMiddleware
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 中间件名称 |

生成到 `app/middleware/`。

### 3.4 生成模型

```bash
php webman madong-make:model GoodsCategory
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 模型名称，自动生成表名（`sys_` + 下划线格式） |

生成到 `app/model/`。

### 3.5 生成服务

```bash
php webman madong-make:service GoodsCategoryService
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 服务名称，自动提取 DAO 名称 |

生成到 `app/service/`。

### 3.6 生成验证器

```bash
php webman madong-make:validate GoodsCategoryValidate
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 验证器名称 |

生成到 `app/validate/`。

## 4. 插件管理 plugin/

插件全生命周期命令，是插件开发的**核心工具集**。

### 4.1 创建插件

```bash
php webman madong-plugin:develop:create test_demo "测试插件" "这是一个测试插件"
# 别名: madong-plugin:dev:create
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 插件名称（snake_case，如 `test_demo`） |
| `title` | 是 | 插件标题 |
| `description` | 否 | 插件描述（默认空） |

生成插件的前端 + 后端目录结构。

### 4.2 打包插件

```bash
php webman madong-plugin:develop:build test-demo
# 别名: madong-plugin:dev:build
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `key` | 是 | 插件 key（kebab-case，如 `test-demo`） |
| `-t, --target` | 否 | 目标目录路径（默认 `runtime/plugins`） |

生成 ZIP 插件包。

### 4.3 删除插件（开发清理）

```bash
php webman madong-plugin:develop:delete test-demo
# 别名: madong-plugin:dev:delete
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `key` | 是 | 插件 key（kebab-case） |

清理后端目录、前端目录（admin/web）、runtime 目录与 ZIP、build 目录。

### 4.4 安装插件

```bash
php webman madong-plugin:install portal local
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 插件名称 |
| `mode` | 否 | 安装模式：`local`（默认）/ `market` |

### 4.5 卸载插件

```bash
php webman madong-plugin:uninstall portal
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 插件名称 |

### 4.6 删除插件（正式）

```bash
php webman madong-plugin:delete portal
# 别名: madong-plugin:remove
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 插件名称 |

> 要求插件必须先卸载，通过 `PluginUninstallService` 统一入口执行。

### 4.7 列出插件

```bash
php webman madong-plugin:list
```

无参数，表格输出所有插件（名称、标题、版本、是否安装、安装时间）。

### 4.8 插件运行器

```bash
php webman madong-plugin:run portal install
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 插件名称 |
| `action` | 是 | 操作：`install` / `uninstall` / `delete` / `update` / `export` |
| `version` | 否 | 版本号（用于 `update`） |
| `-f, --force` | 否 | 强制运行迁移（忽略历史记录） |
| `-d, --data` | 否 | `export` 时包含数据 |
| `-o, --output` | 否 | 导出文件路径（用于 `export`） |

自动调用插件的 `Install` 类或对应服务执行操作。

### 4.9 插件迁移

```bash
php webman madong-plugin-migrate portal up
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `plugin` | 是 | 插件名称 |
| `operate` | 是 | 操作：`up` / `seed` / `rollback` / `status` |

复用 `PluginInstall` 的 `runMigrations()` / `runSeeds()`。

### 4.10 插件传输（分发到仓库/多端）

```bash
php webman madong-plugin:transfer demo full
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 插件名称（如 `demo`） |
| `scenario` | 是 | 场景：`backend`（仅后端）/ `full`（后端 + admin 前端 + web 前端）/ `extract`（提取到 download） |
| `-s, --source` | 否 | 自定义源目录 |

辅助开发者将插件提取到 `download/plugin/{name}`（对接私有仓库），或从 download 分发到项目后端和前端目录。

## 5. 配置同步 config/

菜单模板与配置同步命令。

### 5.1 查看 MySQL 配置

```bash
php webman madong-config:mysql
```

无参数，表格输出所有数据库连接的配置（name/default/driver/host/port/database/...），默认连接置顶。

### 5.2 同步后台菜单（单租户）

```bash
php webman madong:migrate-admin-menu
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `-s, --sync` | 否 | 智能同步：新增缺失 + 更新已有 + 删除文件中不存在的节点 |
| `-o, --full` | 否 | 全量重导：清空 admin 菜单后重新导入（与 `--sync` 互斥） |

将 `resource/data/menu/admin.php` 与 `sys_menu(app='admin')` 对齐。仅**非租户模式（SINGLE）**下允许；多租户改用 5.3。

### 5.3 同步菜单模板（多租户）

```bash
php webman madong:migrate-menu-template
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `-s, --sync` | 否 | 智能同步 |
| `-o, --full` | 否 | 全量重导 |

将 `resource/data/menu/admin.php` 与 `saas_template_menu(app='admin')` 对齐。仅**多租户模式**下允许；新建租户会从该模板复制菜单树。

### 5.4 同步平台菜单

```bash
php webman madong:migrate-platform-menu
```

将 `resource/data/menu/platform.php` 与 `saas_template_menu(app='platform')` 对齐。参数同上。

### 5.5 同步前台菜单模板

```bash
php webman madong:migrate-web-menu-template
```

将 `resource/data/menu/web.php` 与 `saas_template_web_menu(app='web')` 对齐。仅多租户模式下允许。参数同上。

## 6. 代码检查 check/

### 6.1 检查控制器完整性

```bash
php webman madong:check:controller
# 指定模块
php webman madong:check:controller -m platformapi
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `-m, --module` | 否 | 模块：`platformapi` / `adminapi` / `api` / `all`（默认 `all`） |

通过反射审计控制器类的公开方法：检查 `$request` 使用但未声明、方法缺少返回类型、构造器依赖不存在等问题，输出明细表与汇总表。

### 6.2 完整性检查

```bash
php webman madong:check:integrity
```

检查中间件（是否实现 `MiddlewareInterface`、`process()` 方法、参数数量）、控制器（方法使用 `$request` 是否声明）、命名空间（`app/services` 与 `app/service` 冲突、命名空间是否正确）的一致性问题。

## 7. 安装部署 install/

### 7.1 下载模板

```bash
php webman madong-download:template -m -w -s
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `-m, --mono` | 否 | 下载 mono 模板（`template/mono`） |
| `-w, --web` | 否 | 下载 web 模板（`template/web`） |
| `-s, --skills` | 否 | 下载 skills 模板（`skills/`） |
| `-f, --force` | 否 | 强制更新（覆盖已有） |
| `-b, --branch` | 否 | Git 分支（默认 `main`） |

已存在目录则 `git pull` 更新，不存在则 `git clone`。

### 7.2 安装框架

```bash
# 交互式安装
php webman install:madong
# 非交互安装（全默认值）
php webman install:madong -y
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `--db-host` | 否 | 数据库主机 |
| `--db-port` | 否 | 数据库端口（默认 `3306`） |
| `--db-name` | 否 | 数据库名称 |
| `--db-user` | 否 | 数据库用户名 |
| `--db-pass` | 否 | 数据库密码 |
| `--db-prefix` | 否 | 表前缀（默认 `ma_`） |
| `--admin-username` | 否 | 管理员用户名 |
| `--admin-password` | 否 | 管理员密码 |
| `--admin-email` | 否 | 管理员邮箱 |
| `--install-database` | 否 | 是否安装数据库表（1=是，0=否，默认 1） |
| `--build-project` | 否 | 是否构建前端项目（1=是，0=否，默认 1） |
| `-y, --non-interactive` | 否 | 非交互模式（使用所有默认值） |
| `--skip-env-check` | 否 | 跳过环境检查 |

流程：环境检测 → 数据库配置 → 安装确认 → 执行安装。

### 7.3 数据迁移与种子

```bash
# 执行迁移（默认 up）
php webman madong-migrate
php webman madong-migrate up
# 创建迁移/种子
php webman madong-migrate make CreateUsersTable
php webman madong-migrate make-seed UsersTableSeeder
# 回滚到批次
php webman madong-migrate rollback -b 1
# 运行种子
php webman madong-migrate seed
# 状态
php webman madong-migrate status
# 预览（干运行）
php webman madong-migrate up -d
# 导出 SQL
php webman madong-migrate up --sql=install.sql
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `operate` | 否 | 操作：`make` / `make-seed` / `up`（默认） / `rollback` / `seed` / `status` |
| `name` | 否 | 迁移/种子名称（驼峰） |
| `--connection` | 否 | 数据库连接（默认 `default`） |
| `--seed` | 否 | 迁移后运行种子 |
| `-t, --table` | 否 | 指定迁移表名（不指定自动生成） |
| `-b, --batch` | 否 | 回滚到的批次号（`rollback` 用） |
| `-d, --dry-run` | 否 | 预览迁移（仅 `up` / `rollback`） |
| `-s, --sql` | 否 | 导出 SQL 到文件（含表结构和种子数据） |
| `--no-data` | 否 | 导出 SQL 不含数据（仅表结构） |

## 8. 租户管理 tenant/

### 8.1 租户数据迁移（字段隔离 → 库隔离）

```bash
# 迁移指定租户
php webman tenant:migrate-data -t 1,2,3
# 迁移所有 active 租户
php webman tenant:migrate-data -a
# 预览模式
php webman tenant:migrate-data -a --dry-run
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `-t, --tenant-id` | 否 | 租户 ID（可重复，逗号分隔） |
| `-a, --all` | 否 | 迁移所有 field 模式且状态 active 的租户 |
| `--dry-run` | 否 | 预览模式，只显示将执行的操作 |
| `-f, --force` | 否 | 跳过确认提示 |

将 field 模式（字段隔离）租户数据迁移到 database 模式（库隔离），统一使用 `INSERT ... SELECT WHERE tenant_id = ?` 复制 13 张表数据。四步流程：创建租户库 → 运行租户迁移 → 复制数据 → 更新租户模式。

### 8.2 租户升级

```bash
php webman madong-tenant:upgrade --all
php webman madong-tenant:upgrade --tenant-id 1
php webman madong-tenant:upgrade --all --type plugin --dry-run
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `--tenant-id` | 否 | 指定租户 ID |
| `--all` | 否 | 全部活跃租户 |
| `--dry-run` | 否 | 预览模式（不实际执行） |
| `--type` | 否 | 类型：`migration`（默认）/ `plugin` / `all` |

遍历活跃租户（database 模式），通过 `TenantMigrationService` 自动对比并推送待执行的迁移。

## 9. 元数据 metadata/

### 9.1 权限码收集

```bash
php webman madong:permission:collect
php webman madong:permission:collect -o /path/to/permissions.json
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `-o, --output` | 否 | 输出文件路径（默认 `base_path('permissions.json')`） |

从控制器 `#[Permission]` 注解收集权限，导出为 JSON 文件。

## 10. 编写自定义命令

新命令需继承 `app/command/BaseCommand`，用 `#[AsCommand]` 属性声明名称与描述：

```php
<?php
namespace app\command\check;

use app\command\BaseCommand;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'madong:hello',
    description: '示例命令',
    aliases: ['madong:hello'],
    hidden: false
)]
class HelloCommand extends BaseCommand
{
    protected function configure(): void
    {
        $this->addArgument('name', InputArgument::REQUIRED, '名称');
    }

    public function __invoke(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $name = $input->getArgument('name');
        $io->success("Hello, {$name}!");
        return self::SUCCESS;
    }
}
```

> ⚠️ 命令若放在 `app/command/<子目录>/` 下，需注意命名空间为 `app\command\<子目录>`，且类名不能与同目录其它命令冲突。

### BaseCommand 提供的工具方法

| 方法 | 说明 |
| --- | --- |
| `parseSseEvent()` / `handleSseEvent()` | SSE 事件解析与输出（插件安装/卸载等流式输出） |
| `executeStream()` | 执行流式操作（SSE 迭代器） |
| `deleteDirectory()` | 递归删除目录 |
| `confirm()` | 确认操作 |
| `askPassword()` / `askPasswordWithConfirm()` | 带掩码的密码输入（支持 Windows/Linux） |
| `outputError()` / `outputSuccess()` | 统一错误/成功输出 |

## 11. 约定

- 命令内业务逻辑优先复用 `service`，不要重复写 SQL。
- 破坏性命令加 `--force` / `-y` 确认。
- 长任务用 `BaseCommand::executeStream()` 打印进度，便于运维观察。
- 命令名称统一 `madong-*` / `madong:*` 前缀，便于 `php webman list` 中识别。
