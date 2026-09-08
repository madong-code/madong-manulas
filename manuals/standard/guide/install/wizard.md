# 2.4 安装向导

安装向导负责完成**环境检测 → 数据库建表 → 初始化数据 → 生成锁文件**的全过程，无需手动导入 SQL。

- 前端：`template/install/`
- 后端：`backend/app/install/controller/Index.php` + `core/business/install/InstallService`

## 2.4.1 启动向导

确保后端已运行（`http://127.0.0.1:8500`），然后：

```bash
cd template/install
pnpm install
pnpm dev
```

浏览器打开向导地址，按步骤操作即可。

## 2.4.2 安装步骤

向导共六步，对应 `template/install/src/components/` 下的组件：

| # | 步骤 | 组件 | 说明 |
| --- | --- | --- | --- |
| 1 | 许可协议 | `agreement-step.vue` | 展示并同意许可协议 |
| 2 | 环境检测 | `environment-step.vue` | 检测 PHP 版本、扩展、目录权限 |
| 3 | 数据库配置 | `database-step.vue` | 填写并测试数据库连接 |
| 4 | 参数配置 | `config-step.vue` | 站点信息、管理员账号密码 |
| 5 | 执行部署 | `deploy-step.vue` | 建表、写入初始数据（实时进度） |
| 6 | 安装完成 | `complete-step.vue` | 展示后台地址与账号信息 |

## 2.4.3 后端接口

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/install/check` | 检查是否已安装 |
| `GET` | `/install/agreement` | 获取许可协议内容 |
| `GET` | `/install/environment` | 检测运行环境 |
| `POST` | `/install/test-database` | 测试数据库连接，**成功后自动写入 `.env`** |
| `POST` | `/install/validate-config` | 校验数据库与管理员配置 |
| `GET` | `/install` | 执行安装（SSE 流式返回进度） |

### 安装状态检查

```php
public function check(Request $request): Response
{
    if ($this->installService->checkInstalled()) {
        $lockFile = base_path() . '/install.lock';
        $installTime = file_exists($lockFile)
            ? trim(file_get_contents($lockFile))
            : '';
        return Json::fail('系统已安装', [
            'installed'    => true,
            'install_time' => $installTime,
        ]);
    }
    return Json::success('系统未安装', ['installed' => false]);
}
```

判断依据是 `backend/install.lock` 是否存在，文件内容为安装时间。

### 数据库连接测试会写入 `.env`

```php
public function testDatabase(Request $request): Response
{
    $databaseConfig = $request->all();

    $dbErrors = $this->installService->validateDatabaseConfig($databaseConfig);
    if (!empty($dbErrors)) {
        return Json::fail(implode('; ', $dbErrors));
    }

    $result = $this->installService->testDatabaseConnection($databaseConfig);

    // 测试成功后，配置 .env 文件（为后续安装步骤准备）
    $this->installService->saveDatabaseConfig($databaseConfig);

    return Json::success('数据库连接测试成功', $result);
}
```

> 这一步会**覆盖** `backend/.env` 中的数据库配置项，请确认填写无误。

### 安装进度采用 SSE 推送

安装过程可能耗时较久，后端以 `text/event-stream` 流式返回进度：

```php
public function install(Request $request): \Generator
{
    $connection = $request->connection;
    $data       = $request->all();

    $connection->send(new Response(200, [
        'Content-Type'  => 'text/event-stream',
        'Cache-Control' => 'no-cache',
        'Connection'    => 'keep-alive',
        // ...
    ], "\r\n"));

    $generator = $this->installService->install($data);
    foreach ($generator as $chunk) {
        $connection->send($chunk);
    }
}
```

前端据此实时渲染"正在创建数据表 / 正在写入初始数据"等进度信息。

## 2.4.4 安装完成之后

1. 后端根目录生成 **`install.lock`**，再次访问安装接口会返回"系统已安装"。
2. `backend/.env` 中数据库配置已被写入实际值。
3. 使用向导中设置的管理员账号登录 admin 端。

### 重新安装

删除锁文件并清空数据库即可：

```bash
rm backend/install.lock
```

```sql
DROP DATABASE `madong_saas`;
CREATE DATABASE `madong_saas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

> 生产环境请勿保留安装端，部署时应移除 `template/install` 的构建产物。

## 2.4.5 安装失败排查

| 现象 | 排查方向 |
| --- | --- |
| 环境检测不通过 | 对照 [2.1 环境要求](environment.md) 补齐 PHP 扩展、放开被禁用函数 |
| 数据库连接失败 | 确认账号密码、库是否已创建、MySQL 是否允许该主机连接 |
| 建表中途报错 | 查看 `backend/runtime/logs/` 日志；确认数据库用户具备 `CREATE`/`ALTER` 权限 |
| 提示"系统已安装" | 删除 `backend/install.lock` |
| 进度条卡住不动 | SSE 被 Nginx 缓冲，开发期请直连后端；生产需配置 `proxy_buffering off` |

> 下一章：[3. 前端开发](../frontend/index.md)
