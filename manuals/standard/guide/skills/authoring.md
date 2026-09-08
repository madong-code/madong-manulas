# 编写自定义技能

技能本质是一个目录 + 一个 `SKILL.md`（YAML frontmatter + Markdown 正文）。同步脚本会按规则复制到各编辑器目录。

## 目录结构

```
skills/<domain>/<skill-name>/
└── SKILL.md       # 必填
```

- `domain`：`backend` / `frontend` / `theme` / 其它。
- `skill-name`：kebab-case，如 `controller`、`generator`。

## SKILL.md 模板

```markdown
---
name: backend-controller
description: 生成遵循 OpenAPI 注解路由与四层架构的 Webman 控制器
---

# 控制器规范

## 路由
使用 `#[OA\Get/Post/...]` 注解声明路由，不写 route.php。
...

## 约束
- 必须 extends Crud 或 Base
- 必须声明 #[Permission(code: ...)]
...
```

## 编写要点

1. **name**：全局唯一，建议 `<domain>-<skill-name>`。
2. **description**：一句话说清「何时触发」，AI 据此自动匹配。要包含关键词（如「控制器」「四层架构」「注解路由」）。
3. **正文**：写清目录约定、基类、注解范式、禁止事项，最好附最小可运行片段。
4. **保持与代码一致**：技能描述的是实际代码约定，代码改了技能要同步更新，否则会误导 AI。

## 跨编辑器分发

同步脚本 `skills/sync.ps1` / `sync.sh` 已内置各编辑器目标映射；新增技能目录后重新运行同步即可。若要新增目标编辑器，在同步脚本里追加对应输出目录规则。

## 校验

- 运行 `skills/sync.sh codebuddy`，确认 `.codebuddy/skills/<name>/SKILL.md` 生成。
- 在编辑器里用 `@<name>` 触发，验证描述与内容被正确加载。
