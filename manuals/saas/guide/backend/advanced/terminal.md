# Web 终端

Web 终端允许在**后台界面直接执行服务器命令**（如安装依赖、构建前端），底层用 `phpseclib` 建立 SSH/SFTP 通道，通过 SSE 实时回传输出。

## 配置

`config/terminal.php` 定义包管理器、命令集、前端产物拷贝映射：

- `npm_package_manager`：默认 `pnpm`（可选 npm/cnpm/yarn/pnpm）。
- `commands`：按分组定义命令——`install`（admin/web/h5/app/server）、`build`（admin/web/h5/app）、`check`（node/npm/pnpm/composer）、`custom`、`debug`。
- `execution`：输出目录 `{backend_root}/runtime/install/terminal/exec.log`、`timeout`、`poll_interval`。
- `frontend_programs`：构建后把 `template/mono/apps/admin/dist` 拷贝到 `public/admin`，`template/mono/apps/platform/dist` → `public/platform`，`template/web/.output/public` → `public/web` 等（含清理与保留 `.gitkeep`）。
- `web.command_groups`：前端界面分组（测试/安装依赖/重新发布/自定义命令）。

## 控制器

`app/adminapi/controller/devtools/TerminalController` 提供终端接口，典型方法：

```php
#[OA\Post(path: '/devtools/terminal/exec', summary: '终端执行命令')]
#[OA\Post(path: '/devtools/terminal/install/{type}', summary: '执行安装')]
#[OA\Post(path: '/devtools/terminal/build/{type}', summary: '执行构建')]
#[OA\Get(path: '/devtools/terminal/command-groups', summary: '获取命令分组')]
```

执行采用 SSE 流式返回（`text/event-stream`），鉴权失败由 `SseHelper` 统一处理。

## 自定义命令

在 `config/terminal.php` 的 `commands.custom` 下新增条目，并通过 `before`/`after` 拦截器（`app\service\core\terminal\intercept\*`）做前后置处理：

```php
'custom' => [
    'my-task' => [
        'cwd' => '{backend_root}',
        'command' => 'php start.php my:task',
        'description' => '执行自定义任务',
        'before' => ['class' => CustomIntercept::class, 'method' => 'before'],
        'after'  => ['class' => CustomIntercept::class, 'method' => 'after'],
    ],
],
```

> 安全提示：Web 终端具备服务器命令执行能力，务必仅在受信任的内网/管理员环境启用，并通过 JWT + 超级管理员中间件严格控制访问。
