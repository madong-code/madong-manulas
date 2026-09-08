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
# 首次使用赋予执行权限
chmod +x skills/sync.sh

# 同步全部编辑器
./skills/sync.sh

# 只同步某个编辑器（推荐）
./skills/sync.sh codebuddy
./skills/sync.sh cursor
./skills/sync.sh trae
./skills/sync.sh copilot
```

## 同步目标位置

| 编辑器 | 位置 | 格式 |
| --- | --- | --- |
| CodeBuddy | `.codebuddy/skills/{name}/` | `{name}/SKILL.md` |
| Cursor | `.cursor/rules/{name}/` | `{name}/rule.mdc` |
| Trae Skills | `.agents/skills/{name}/` | `{name}/SKILL.md` |
| Trae Rules | `.trae/rules/{name}/` | `{name}/rule.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | 聚合 Markdown |

> 修改 `skills/` 源文件后，重新运行同步脚本即可分发到所有编辑器。

## 在各编辑器中触发

### CodeBuddy

1. 运行同步脚本。
2. 打开 **设置 → 技能**，应看到所有技能。
3. 对话中输入 `@backend-controller` 或描述需求自动触发。

### Trae

- 技能：同步到 `.trae/skills/{name}/SKILL.md`
- 规则：同步到 `.trae/rules/{name}/rule.md`
- 启动后自动加载，无需额外配置。

### Cursor

- 规则自动出现在 **Rules** 管理界面（同步后需重启）。
- 文件：`.cursor/rules/{name}/rule.mdc`

### GitHub Copilot

- 所有规范聚合在 `.github/copilot-instructions.md`，自动读取，无需操作。

## 常见用法示例

| 需求 | 命中技能 |
| --- | --- |
| 生成一个完整的后台 CRUD 模块 | `backend/gen/crud`（migration→model→controller→service→dao→…→前端） |
| 写一个后台控制器 | `backend/controller` |
| 写前端 admin 的 CRUD 页面 | `frontend/admin/view` + `frontend/shared/*` |
| 写平台应用页面 | `frontend/platform/*` + `frontend/shared/*` |
| 开发一个应用插件 | `backend/plugin` + `backend/route` |
| 给接口加权限码 | `backend/controller` + `backend/route` |
| 多租户数据隔离 | `backend/scope`（TenantScope / DataPermissionScope） |
| 做代码生成器二次开发 | `backend/gen/generator` + `backend/gen/parse-table` |

> 提示：技能是「规范约束」，生成后仍建议按 [编码规范](../dev-guide/code-style.md) 复核，再联调验证。
