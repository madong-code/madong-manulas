# 后端 · 数据库迁移（Phinx）

使用 **Phinx** 管理表结构演进，保证多环境一致。

---

## 1. 配置

- 迁移配置：`phinx.php`（数据库连接取自 `.env`）。
- 业务迁移目录：`app/migration/`。
- 内核迁移内置 `core/`（随内核升级）。

---

## 2. 常用命令

```bash
# 执行迁移（建表/改表）
php phinx migrate

# 回滚到上一个
php phinx rollback

# 执行 seed（初始数据）
php phinx seed:run

# 查看状态
php phinx status
```

---

## 3. 迁移文件写法

```php
use Phinx\Migration\AbstractMigration;

class CreateRoleTable extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('mic_system_role', ['comment' => '角色']);
        $table->addColumn('name', 'string', ['limit' => 50, 'comment' => '名称'])
              ->addColumn('code', 'string', ['limit' => 50, 'comment' => '编码'])
              ->addColumn('sort', 'integer', ['default' => 0])
              ->addColumn('status', 'integer', ['default' => 1])
              ->addColumn('created_at', 'datetime')
              ->addColumn('updated_at', 'datetime')
              ->create();
    }
}
```

---

## 4. 初始数据（Seed）

字典、菜单、角色等基础数据用 seed 初始化（安装向导也会写入）。

---

## 5. 约定

- **禁止**手动改生产库表结构，统一走迁移 + 评审。
- 迁移文件一旦合并**不可修改**，需改结构另写新迁移。
- 字段类型与 Model `$casts` 保持一致（如 `id` 用 BIGINT，Model 转 `string`）。
- 表名带 `mic_` 前缀。
