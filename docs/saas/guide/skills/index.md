# 6 Skills（AI 技能库）

Madong SaaS 内置一套 **AI 技能库**（`skills/`），让 AI 编辑器（CodeBuddy / Cursor / Trae / Copilot 等）理解项目规范，生成符合后端四层架构与前端约定的代码。详见 `skills/README.md`。

## 覆盖领域

| 领域 | 目录 | 数量 |
| --- | --- | --- |
| 后端规范 + 代码生成 | `skills/backend/` | 43 项（23 规范性 + 20 代码生成） |
| 前端（按应用归类） | `skills/frontend/` | 21 项（shared / admin / platform / install） |
| 跨层规范 | `skills/cross/` | 6 项（API 约定 / 数据库 / 脚手架 / Git / Lint） |

## 同步机制

通过 `skills/sync.ps1`（Windows）或 `skills/sync.sh`（macOS/Linux）把技能一键分发到各 AI 编辑器目录（`.codebuddy/skills`、`.cursor/rules`、`.trae`、`.agents`、`.github`）。

## 本章导航

- [技能目录](catalog.md) - 完整技能清单与作用
- [使用方式](usage.md) - 同步到编辑器与触发方式
- [编写自定义技能](authoring.md) - 新增技能规范
