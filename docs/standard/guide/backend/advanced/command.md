# 后端 · 命令行

自定义命令行指令用于运维、数据修复、一次性任务。

---

## 1. 指令目录

指令位于 `app/command/`，继承 Webman 命令基类（Symfony Console）。

```php
namespace app\command;

use support\Db;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class HelloCommand extends Command
{
    protected static $defaultName = 'hello';
    protected static $defaultDescription = '示例指令';

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('hello');
        return self::SUCCESS;
    }
}
```

---

## 2. 注册与运行

在 `config/console.php`（或指令注册处）登记指令类，然后：

```bash
php webman hello
```

---

## 3. 典型用途

- 数据修复脚本。
- 缓存预热。
- 导入/导出。
- 定时任务的前置脚本（由 scheduler 调起）。

---

## 4. 约定

- 指令内业务逻辑优先复用 `service`，不要重复写 SQL。
- 破坏性指令加 `--force` 确认。
- 长任务打印进度，便于运维观察。
