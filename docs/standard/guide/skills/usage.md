# 使用方式

## 同步技能到编辑器

### Windows

```powershell
# 同步全部编辑器
powershell -ExecutionPolicy Bypass -File skills\sync.ps1

# 只同步某个编辑器（推荐）
powershell -ExecutionPolicy Bypass -File skills\sync.ps1 -target codebuddy
powershell -ExecutionPolicy Bypass -File skills\sync.ps1 -target cursor
powershell -ExecutionPolicy Bypass -File skills\sync.ps1 -target trae
powershell -ExecutionPolicy Bypass -File skills\sync.ps1 -target copilot
```

### macOS / Linux

```bash
chmod +x skills/sync.sh
./skills/sync.sh            # 全部
./skills/sync.sh codebuddy  # 仅 CodeBuddy
```

## 在各编辑器中触发

### CodeBuddy

1. 运行同步脚本。
2. 打开 **设置 → 技能**，应看到所有技能。
3. 对话中输入 `@backend-controller` 或在描述需求时自动触发（如「新建一个岗位控制器」会命中 `backend/controller` 技能）。

### Trae

- 技能：`skills/{name}/SKILL.md` 同步到 `.trae/skills/{name}/SKILL.md`
- 规则：`.trae/rules/{name}/rule.md`

### Cursor

- 规则自动出现在 **Rules** 管理界面（同步后需重启）。
- 文件：`.cursor/rules/{name}/rule.mdc`

### GitHub Copilot

- 所有规范聚合在 `.github/copilot-instructions.md`，自动读取。

## 常见用法示例

- 「用四层架构生成一个商品模块」→ 命中 `generator` + `controller/service/dao/model`。
- 「给这个接口加上权限码」→ 命中 `route` + `controller`。
- 「在前端 admin 新建一个 CRUD 页」→ 命中 `frontend/admin`。
- 「开发一个内容审核插件」→ 命中 `backend/plugin` + `backend/review`（配置）。

> 提示：技能是「规范约束」，生成后仍建议按[编码规范](../dev-guide/code-style.md) 复核，再联调验证。
